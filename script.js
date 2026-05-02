let cart = [];

/* SLIDER */
let slider = document.getElementById("mainSlider");
let index = 0;

setInterval(()=>{
    if(!slider) return;
    index++;
    if(index >= slider.children.length) index = 0;
    slider.scrollLeft = index * slider.offsetWidth;
},3000);

/* ADD CART */
function addToCart(name, price){
    cart.push({name, price});
    document.getElementById("count").innerText = cart.length;
    updateCartUI();
}

/* SHOW CART */
function showCart(){
    document.getElementById("cartBox").style.display = "block";
}

function closeCart(){
    document.getElementById("cartBox").style.display = "none";
}

/* UPDATE CART */
function updateCartUI(){
    let box = document.getElementById("cartItems");
    box.innerHTML = "";

    let subtotal = 0;

    cart.forEach(item=>{
        box.innerHTML += `<p>${item.name} - ৳${item.price}</p>`;
        subtotal += item.price;
    });

    let delivery = Number(document.getElementById("location").value);
    let total = subtotal + delivery;

    document.getElementById("subtotal").innerText = subtotal;
    document.getElementById("total").innerText = total;
}
