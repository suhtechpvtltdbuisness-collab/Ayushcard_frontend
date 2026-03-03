const fs = require('fs');
const file = './src/components/admin/AyushCardPreview.jsx';
let content = fs.readFileSync(file, 'utf8');

const backStart = content.indexOf('  const Back = () => (');
const backEndStr = '\n  /* ================= RETURN ================= */';
const backEnd = content.indexOf(backEndStr);

if (backStart !== -1 && backEnd !== -1) {
  const newBack = `  const Back = () => (
    <div
      className="absolute inset-0 backface-hidden"
      style={{ transform: "rotateY(180deg)" }}
    >
      {/* Golden Wrapper */}
      <div className="h-full w-full bg-[#E5B556] rounded-[36px] relative shadow-lg">

        {/* Main Card (Red Gradient) */}
        <div className="absolute top-[16px] left-[16px] w-[calc(100%-56px)] h-[calc(100%-16px-40px)] bg-linear-to-r from-[#D93832] via-[#E86D24] to-[#F19C16] px-6 py-5 text-white flex flex-col z-10 overflow-hidden shadow-sm" style={{ borderRadius: '24px' }}>
             {/* Header */}
             <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                        <img src="/logo1.svg" alt="logo" className="w-[85%] h-[85%] object-contain" />
                     </div>
                     <div className="flex flex-col justify-center">
                         <div className="border-t-[1.5px] border-b-[1.5px] border-white py-0.5 mb-1 inline-block">
                             <h2 className="text-[14px] font-bold m-0 leading-tight tracking-wide drop-shadow-sm">BAIJNAATH KESAR</h2>
                             <h2 className="text-[14px] font-bold m-0 leading-tight tracking-wide drop-shadow-sm">BAI SEWA TRUST</h2>
                         </div>
                         <p className="text-[10px] m-0 font-medium tracking-wide">Card No: {data?.id || 'AC-2962638'}</p>
                     </div>
                 </div>
                 <div className="text-right flex flex-col justify-center pt-1.5">
                     <h1 className="text-[20px] font-bold m-0 tracking-wide mb-1 leading-tight drop-shadow-sm">AYUSH CARD</h1>
                     <p className="text-[9px] m-0 font-medium tracking-wide">सेहत का सुरक्षा कवच - आयुष्य कार्ड के साथ !</p>
                     <p className="text-[9px] m-0 font-medium tracking-wide mt-0.5">Health Shield - With Ayush Card!</p>
                 </div>
             </div>

             {/* Body */}
             <div className="flex gap-6 mt-1 flex-1">
                 {/* Family Table */}
                 <div className="flex-[1.1] flex flex-col self-start">
                    <div className="text-white text-center font-bold py-1 text-[11px] tracking-wide mb-1.5 rounded-sm drop-shadow-sm shadow-inner uppercase tracking-widest border border-white/20">
                       Family Details
                    </div>
                    <div className="w-full bg-white text-black shrink-0 border border-gray-300 rounded-[4px] overflow-hidden shadow-sm">
                        <table className="w-full text-center border-collapse">
                            <thead>
                               <tr className="bg-gray-100 text-[10px] font-bold border-b border-gray-200">
                                   <th className="py-1.5 px-2 border-r border-gray-200 w-10">Sr No</th>
                                   <th className="py-1.5 px-2 border-r border-gray-200 text-left">Name</th>
                                   <th className="py-1.5 px-2 border-r border-gray-200 w-10">Age</th>
                                   <th className="py-1.5 px-2 text-left">Relation</th>
                               </tr>
                            </thead>
                            <tbody className="text-[10px] font-medium">
                               {[
                                 { name: 'Parmanand', age: 41, relation: 'Spouse' },
                                 { name: 'Ankit', age: 16, relation: 'Son' },
                                 { name: 'Ragini', age: 15, relation: 'Daughter' },
                                 { name: 'Shalini', age: 12, relation: 'Daughter' },
                                 { name: 'Nandini', age: 9, relation: 'Daughter' }
                               ].map((m, i) => (
                                  <tr key={i} className="border-b border-gray-200 last:border-0 hover:bg-slate-50">
                                    <td className="py-1 px-2 border-r border-gray-200">{i+1}</td>
                                    <td className="py-1 px-2 border-r border-gray-200 text-left truncate">{m.name}</td>
                                    <td className="py-1 px-2 border-r border-gray-200">{m.age}</td>
                                    <td className="py-1 px-2 text-left truncate">{m.relation}</td>
                                  </tr>
                               ))}
                            </tbody>
                        </table>
                    </div>
                 </div>

                 {/* Instructions & Dates */}
                 <div className="flex-[0.9] flex flex-col justify-between pb-1 h-full">
                     <div className="mt-1">
                         <h3 className="font-bold text-[10px] uppercase mb-1.5 tracking-wide drop-shadow-sm text-white border-b border-white/30 pb-1 w-full">Important Info / Instructions</h3>
                         <ol className="text-[9.5px] list-decimal list-inside space-y-1 ml-0.5 text-white/95 font-medium leading-relaxed font-sans">
                            <li>Carry this card during every hospital visit.</li>
                            <li>Inform NGO staff if the card is lost.</li>
                            <li>This card is non-transferable.</li>
                            <li>Update your info yearly with coordinator.</li>
                         </ol>
                     </div>
                     <div className="flex gap-3 justify-between items-center bg-white/10 p-2.5 px-3 rounded-xl border border-white/20 shadow-sm mt-3 w-content mr-4">
                         <span className="text-[11px] font-bold tracking-wider drop-shadow-sm uppercase">Issue<br/>Date</span>
                         <div className="bg-white text-black p-2 py-1.5 text-[10px] font-bold flex-1 rounded border border-gray-300 shadow-sm leading-relaxed flex flex-col justify-center gap-0.5 w-[140px]">
                            <div className="flex justify-between items-center"><span className="text-gray-600 font-semibold w-12 text-left">Date</span>: <span className="font-bold flex-1 text-right">14 Jan 2026</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-600 font-semibold w-12 text-left">Expiry</span>: <span className="font-bold flex-1 text-right">14 Jan 2027</span></div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>

        {/* Right Rotated Footer */}
        <div className="absolute right-0 top-0 w-[42px] h-full flex items-center justify-center z-20">
          <div className="transform rotate-90 whitespace-nowrap text-[11.5px] text-[#553b11] font-bold flex gap-6 tracking-wide drop-shadow-sm pl-2">
            <span className="flex items-center gap-1.5"><MapPin size={12} strokeWidth={2.5} className="inline mr-0.5" /> Mangla Vihar Kanpur - 208015</span>
            <span className="flex items-center gap-1.5"><Phone size={12} strokeWidth={2.5} className="inline mr-0.5" /> 9927384859</span>
            <span className="flex items-center gap-1.5"><Mail size={12} strokeWidth={2.5} className="inline mr-0.5" /> baijnaathkesarbaisewatrust9625@gmail.com</span>
          </div>
        </div>

      </div>
    </div>
  );\n`;
  content = content.substring(0, backStart) + newBack + content.substring(backEnd);
  fs.writeFileSync(file, content);
  console.log("Updated AyushCardPreview.jsx");
} else {
  console.log("Could not find boundaries");
}
