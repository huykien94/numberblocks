// Visual-only flights. State is committed by the caller after arrival.
export function createBlockMotion({reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches}={}){
 const flights=new Set();
 function cancel(){for(const {animation,clone,block,opacity} of flights){animation.cancel();clone.remove();block.style.opacity=opacity;}flights.clear();}
 async function fly(source,destination,{remove=false}={}){
  if(!source||!destination||reduced())return;
  const blocks=source.matches('.unit')?[source]:Array.from(source.querySelectorAll('.unit'));
  const target=destination.getBoundingClientRect();
  await Promise.all(blocks.map(async(block,i)=>{
   const from=block.getBoundingClientRect(),clone=block.cloneNode(true);
   clone.removeAttribute('data-block');clone.removeAttribute('aria-label');clone.removeAttribute('disabled');clone.setAttribute('aria-hidden','true');clone.tabIndex=-1;
   clone.classList.remove('result-unit','used');clone.classList.add('flying-block');
   Object.assign(clone.style,{position:'fixed',left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`,margin:'0',pointerEvents:'none'});
   document.body.append(clone);const opacity=block.style.opacity;block.style.opacity='.15';
   const x=target.left+target.width/2-from.left-from.width/2+(i-(blocks.length-1)/2)*20;
   const y=target.top+target.height/2-from.top-from.height/2;
   const animation=clone.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${x*.5}px,${y*.5-45}px) scale(1.12)`,opacity:1},{transform:`translate(${x}px,${y}px) scale(${remove?.2:1})`,opacity:remove?0:1}],{duration:520,delay:i*45,easing:'ease-in-out',fill:'forwards'});
   const flight={animation,clone,block,opacity};flights.add(flight);
   try{await animation.finished;}catch{}finally{clone.remove();block.style.opacity=opacity;flights.delete(flight);}
  }));
 }
 return {fly,cancel};
}
