const PRODUCTS = [
  {id:"sport-001",name:"Rookie Season",detail:"Basketball · Rookie card",category:"Sports",price:24.00,symbol:"✦",bg:"#a9c5a6",tag:"COLLECTOR PICK"},
  {id:"{id:9,name:"Charizard EX",type:"Pokémon",price:49.99,art:"🔥",grade:"Near Mint"},
  {id:"mtg-001",name:"Verdant Guardian",detail:"Magic · Mythic rare",category:"Magic",price:32.00,symbol:"✧",bg:"#b5a4c6",tag:"MYTHIC"},
  {id:"anime-001",name:"Grand Voyage",detail:"Anime & TCG · Special art",category:"Anime & TCG",price:14.00,symbol:"✳",bg:"#d59a7c",tag:"SPECIAL ART"},
  {id:"sport-002",name:"The Big Moment",detail:"Baseball · Vintage style",category:"Sports",price:42.00,symbol:"◈",bg:"#c4b79a",tag:"VINTAGE"},
  {id:"poke-002",name:"Moonlit Spark",detail:"Pokémon · Illustration rare",category:"Pokémon",price:27.00,symbol:"☾",bg:"#a9b7d2",tag:"NEW ARRIVAL"},
  {id:"other-001",name:"Pop Culture Icon",detail:"Entertainment · Limited",category:"Other",price:21.00,symbol:"★",bg:"#d5a4a2",tag:"LIMITED"},
  {id:"mtg-002",name:"Arcane Relic",detail:"Magic · Foil edition",category:"Magic",price:16.00,symbol:"⌘",bg:"#a9b7a0",tag:"FOIL"}
];
const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);
let cart = JSON.parse(localStorage.getItem("cardz-cart") || "{}");
let category = "All";
const grid = $("#product-grid");
function save(){localStorage.setItem("cardz-cart",JSON.stringify(cart));renderCart()}
function renderProducts(){
  let list = PRODUCTS.filter(p => (category==="All" || p.category===category) && (p.name+" "+p.detail+" "+p.category).toLowerCase().includes($("#search").value.toLowerCase()));
  const sort=$("#sort").value;if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);
  grid.innerHTML=list.map(p=>`<article class="product-card"><div class="product-image" style="--card-bg:${p.bg}" data-symbol="${p.symbol}"><span class="product-label">${p.tag}</span><button class="quick-add" data-add="${p.id}">ADD TO CART&nbsp; +</button></div><div class="product-info"><div><small>${p.detail.toUpperCase()}</small><strong>${p.name}</strong></div><span class="product-price">${money(p.price)}</span></div></article>`).join("") || '<p class="empty-cart">No cards match that search.</p>';
}
function renderCart(){
  const entries=Object.entries(cart).filter(([id,q])=>PRODUCTS.some(p=>p.id===id)&&q>0);
  const count=entries.reduce((n,[,q])=>n+q,0),total=entries.reduce((n,[id,q])=>n+PRODUCTS.find(p=>p.id===id).price*q,0);
  $("#cart-count").textContent=count;$("#drawer-count").textContent=`(${count})`;$("#subtotal").textContent=money(total);
  $("#cart-items").innerHTML=entries.length?entries.map(([id,q])=>{const p=PRODUCTS.find(x=>x.id===id);return `<div class="cart-line"><div class="mini-card" style="--mini:${p.bg}">${p.symbol}</div><div><strong>${p.name}</strong><small>${p.detail}</small><div class="qty-controls"><button data-qty="${id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${q}</span><button data-qty="${id}" data-delta="1" aria-label="Increase quantity">+</button></div></div><span class="line-price">${money(p.price*q)}</span></div>`}).join(""):'<p class="empty-cart">Your cart is waiting for its first great find.</p>';
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1900)}
function openCart(){ $("#cart-drawer").classList.add("open");$("#overlay").classList.add("visible");$("#cart-drawer").setAttribute("aria-hidden","false")}
function closeCart(){ $("#cart-drawer").classList.remove("open");$("#overlay").classList.remove("visible");$("#cart-drawer").setAttribute("aria-hidden","true")}
grid.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;const id=b.dataset.add;cart[id]=(cart[id]||0)+1;save();toast("Added to your cart");});
$("#cart-items").addEventListener("click",e=>{const b=e.target.closest("[data-qty]");if(!b)return;const id=b.dataset.qty;cart[id]=(cart[id]||0)+Number(b.dataset.delta);if(cart[id]<=0)delete cart[id];save()});
$("#open-cart").addEventListener("click",openCart);$("#close-cart").addEventListener("click",closeCart);$("#overlay").addEventListener("click",closeCart);
$("#search").addEventListener("input",renderProducts);$("#sort").addEventListener("change",renderProducts);
$("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;category=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts()});
document.querySelectorAll(".category-tile").forEach(b=>b.addEventListener("click",()=>{category=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.category===category));renderProducts();$("#shop").scrollIntoView({behavior:"smooth"})}));
$(".search-toggle").addEventListener("click",()=>{$("#shop").scrollIntoView({behavior:"smooth"});$("#search").focus()});
$("#checkout").addEventListener("click",async()=>{
  const items=Object.entries(cart).filter(([,q])=>q>0).map(([id,quantity])=>({id,quantity}));
  if(!items.length){toast("Your cart is empty");return}
  const button=$("#checkout");button.disabled=true;button.textContent="Preparing secure checkout…";
  try{
    const response=await fetch("/api/create-checkout-session",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({items})});
    const data=await response.json();if(!response.ok)throw new Error(data.error||"Checkout is not configured yet.");
    if(!data.url)throw new Error("No checkout URL was returned.");window.location.href=data.url;
  }catch(err){toast(err.message);button.disabled=false;button.innerHTML='Continue to checkout <span>↗</span>'}
});
$("#year").textContent=new Date().getFullYear();renderProducts();renderCart();
