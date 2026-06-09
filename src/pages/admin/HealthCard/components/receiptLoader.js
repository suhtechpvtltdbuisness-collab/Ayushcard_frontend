import apiService from "../../../../api/service";
import {
  AYUSH_CARD_INCLUDED_MEMBERS,
} from "../../../../components/ayush/ayushCard/constants.js";
import {
  computeAyushCardFeeRupees,
  fullNameFromCardRecord,
} from "../../../../components/ayush/ayushCard/utils.js";

export function formatReceiptAddress(rec) {
  if (!rec) return "—";
  const raw = String(rec.address || "").trim();
  if (!raw) return "—";
  const line = raw.replace(/\s{2,}/g, " ").trim();
  return line.length > 80 ? `${line.slice(0, 80)}…` : line;
}

function pickStr(...values) {
  for (const v of values) {
    const s = String(v ?? "").trim();
    if (s) return s;
  }
  return "";
}

export function extractCardPaymentMeta(rec) {
  if (!rec) {
    return {
      method: "",
      transactionId: "",
      orderId: "",
      hasCashReceiptDoc: false,
      documents: [],
    };
  }

  const pay = rec.payment && typeof rec.payment === "object" ? rec.payment : {};
  const docs = Array.isArray(rec.documents) ? rec.documents : [];

  return {
    method: pickStr(
      pay.method,
      pay.paymentMethod,
      rec.paymentMethod,
      rec.paymentMode,
    ).toLowerCase(),
    transactionId: pickStr(
      pay.transactionId,
      pay.txnId,
      rec.transactionId,
      rec.txnId,
    ),
    orderId: pickStr(pay.orderId, rec.orderId),
    hasCashReceiptDoc: docs.some((d) =>
      String(d?.name || "").toLowerCase().includes("cashpayment"),
    ),
    documents: docs,
  };
}

export function getPaymentDisplay(rec) {
  if (!rec) return { label: "Cash / offline", ref: "Receipt on file" };

  const meta = extractCardPaymentMeta(rec);
  const txn = meta.transactionId;
  const txnIsCash = /^CASH-/i.test(txn);
  const txnIsOnline = /^ONLINE-/i.test(txn);

  const isCash =
    meta.method === "cash" ||
    meta.method === "offline" ||
    meta.hasCashReceiptDoc ||
    txnIsCash;

  const isOnline =
    !isCash &&
    (meta.method === "online" ||
      meta.method.includes("upi") ||
      meta.method.includes("cashfree") ||
      Boolean(meta.orderId) ||
      txnIsOnline ||
      (Boolean(txn) && !txnIsCash) ||
      !meta.hasCashReceiptDoc);

  if (isOnline) {
    return {
      label: "Online",
      ref: txn || meta.orderId || "—",
    };
  }

  return {
    label: "Cash / offline",
    ref: txnIsCash && txn ? txn : "Receipt on file",
  };
}

function resolveReceiptLookupId(card) {
  const mongoCandidates = [
    card?._rawCard?._id,
    card?._apiRaw?._id,
    card?._mongoId,
    card?._id,
  ];
  for (const id of mongoCandidates) {
    if (id && !String(id).startsWith("AC-")) return String(id);
  }
  return String(card?.receiptNo || card?.applicationId || card?.id || "");
}

function mergePaymentFromSources(...sources) {
  const metas = sources.filter(Boolean).map((s) =>
    typeof s === "object" && s.method !== undefined ? s : extractCardPaymentMeta(s),
  );
  return {
    method: pickStr(...metas.map((m) => m.method)),
    transactionId: pickStr(...metas.map((m) => m.transactionId)),
    orderId: pickStr(...metas.map((m) => m.orderId)),
    documents: metas.flatMap((m) => m.documents || []),
    hasCashReceiptDoc: metas.some((m) => m.hasCashReceiptDoc),
  };
}

function resolveCreatedByLabel(rec, wrapper = {}) {
  if (wrapper.employeeName) return wrapper.employeeName;
  const raw = rec?.createdBy;
  if (raw && typeof raw === "object") {
    return (
      raw.name ||
      [raw.firstName, raw.middleName, raw.lastName].filter(Boolean).join(" ").trim() ||
      raw.email ||
      raw.employeeId ||
      ""
    );
  }
  return "";
}

export async function fetchFullReceiptCard(card) {
  const lookupId = resolveReceiptLookupId(card);
  const seedSources = [card?._apiRaw, card?._rawCard, card].filter(Boolean);

  const applyEnrichment = (raw, members = []) => {
    const merged = mergePaymentFromSources(...seedSources, raw);
    const payment = {
      method: merged.method || (merged.hasCashReceiptDoc ? "cash" : "online"),
      transactionId: merged.transactionId,
      orderId: merged.orderId,
      totalPaid: Number(
        raw?.payment?.totalPaid ??
        raw?.payment?.totalAmount ??
        raw?.totalAmount ??
        card?.amount ??
        0,
      ) || undefined,
      totalAmount: Number(
        raw?.payment?.totalAmount ??
        raw?.payment?.totalPaid ??
        raw?.totalAmount ??
        card?.amount ??
        0,
      ) || undefined,
    };

    const documents =
      (Array.isArray(raw?.documents) && raw.documents.length > 0
        ? raw.documents
        : merged.documents) || [];

    const clientName =
      fullNameFromCardRecord(raw) ||
      card?.clientName ||
      card?.applicant ||
      "";

    return {
      ...card,
      clientName,
      mobile: raw?.contact || card?.mobile || card?.phone,
      address: raw?.address || card?.address,
      pincode: raw?.pincode || card?.pincode,
      employeeName: resolveCreatedByLabel(raw, card) || card?.employeeName,
      amount: payment.totalAmount || payment.totalPaid || card?.amount || 0,
      payment,
      _rawCard: {
        ...raw,
        members,
        payment,
        documents,
        paymentMethod: payment.method,
        transactionId: payment.transactionId,
        orderId: payment.orderId,
      },
    };
  };

  if (!lookupId) return applyEnrichment(card?._apiRaw || card?._rawCard || card || {});

  try {
    let res;
    try {
      res = await apiService.getHealthCardById(lookupId);
    } catch (err) {
      if (err?.response?.status === 404) {
        const cardNo = card?._rawCard?.cardNo || card?._apiRaw?.cardNo || card?.cardNo;
        if (cardNo) {
          res = await apiService.getHealthCardByCardNo(String(cardNo));
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const raw = res?.data?.card || res?.data?.data || res?.data || res;
    const mongoId = raw?._id || lookupId;

    let members = Array.isArray(raw?.members) ? raw.members : [];
    try {
      const mRes = await apiService.getCardMembers(String(mongoId));
      const mRaw = Array.isArray(mRes?.data)
        ? mRes.data
        : Array.isArray(mRes?.data?.members)
          ? mRes.data.members
          : Array.isArray(mRes)
            ? mRes
            : [];
      if (mRaw.length > 0) members = mRaw;
    } catch {
      /* optional */
    }

    let enriched = applyEnrichment(raw, members);

    const createdById = raw?.createdBy;
    const needsEmployeeFetch =
      !enriched.employeeName &&
      createdById &&
      typeof createdById === "string";

    if (needsEmployeeFetch) {
      try {
        const empRes = await apiService.getEmployeeById(createdById);
        const u =
          empRes?.data?.user ||
          empRes?.user ||
          empRes?.data?.data ||
          empRes?.data ||
          empRes;
        const name =
          u?.name ||
          [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() ||
          u?.email ||
          "";
        if (name) enriched = { ...enriched, employeeName: name };
      } catch {
        /* optional */
      }
    }

    return enriched;
  } catch (err) {
    console.warn("[fetchFullReceiptCard] failed:", err);
    return applyEnrichment(card?._apiRaw || card?._rawCard || card || {});
  }
}

export function buildReceiptViewModel(enrichedCard) {
  const rec = enrichedCard?._rawCard || enrichedCard || {};
  const wrapper = enrichedCard || {};

  const displayAppId =
    rec.applicationId != null
      ? String(rec.applicationId)
      : wrapper.receiptNo || wrapper.id || "—";

  const displayName =
    fullNameFromCardRecord(rec) || wrapper.clientName || wrapper.applicant || "—";
  const displayPhone = rec.contact || wrapper.mobile || wrapper.phone || "—";
  const displayAadhaarRaw = String(rec.aadhaarNumber || "");
  const rawAddress = rec.address || wrapper.address || "";
  const displayPin = rec.pincode || wrapper.pincode || "—";

  const listMembers = Array.isArray(rec.members) ? rec.members.filter(Boolean) : [];
  const totalIncludingHead =
    Number(rec.totalMembers ?? rec.totalMember ?? wrapper.totalMember ?? 1) || 1;
  const extraMembersBeyondIncluded = Math.max(
    0,
    totalIncludingHead - AYUSH_CARD_INCLUDED_MEMBERS,
  );

  const receiptTotal = (() => {
    if (rec.totalAmount != null && !Number.isNaN(Number(rec.totalAmount))) {
      return Number(rec.totalAmount);
    }
    if (rec.payment?.totalAmount != null) return Number(rec.payment.totalAmount);
    if (rec.payment?.totalPaid != null) return Number(rec.payment.totalPaid);
    if (wrapper.amount != null) return Number(wrapper.amount);
    return computeAyushCardFeeRupees(totalIncludingHead);
  })();

  const receiptDate = (() => {
    const fullTs = rec.createdAt || rec.updatedAt;
    if (fullTs) return new Date(fullTs);
    const rawDateStr = rec.applicationDate != null ? String(rec.applicationDate).trim() : "";
    if (rawDateStr.length > 10) return new Date(rawDateStr.replace(/(Z|\+00:00)$/, ""));
    return new Date();
  })();

  const paymentRec = {
    ...rec,
    payment: wrapper.payment || rec.payment,
    documents: rec.documents,
  };
  const { label: paymentLabel, ref: paymentRef } = getPaymentDisplay(paymentRec);

  return {
    displayAppId,
    cardNo: rec.cardNo ? String(rec.cardNo) : "",
    displayName,
    displayPhone,
    displayAadhaarRaw,
    displayAddress: rawAddress,
    displayPin,
    listMembers,
    extraMembersBeyondIncluded,
    receiptTotal,
    receiptDate,
    paymentLabel,
    paymentRef,
    createdByLabel: resolveCreatedByLabel(rec, wrapper) || "—",
    campName: rec.campName || rec.campId?.name || rec.ngoLocation || "",
  };
}
