const apiUrl = "http://localhost:3000/api/teddies";
const currencySymbol = "&euro;";

const categoryLinks = document.getElementsByClassName('category-link');
for(let i = 0; i < 3; i++) {
	categoryLinks[i].addEventListener('mouseover', function(){
		document.querySelector('.category-active').classList.remove('category-active');
	    this.parentNode.classList.add('category-active');
	}, false);
}

/* Display shopping cart count */
const cartCountDisplay = document.querySelector('.cart-count');
if(localStorage.cartCount && localStorage.cartCount != 0) {
	cartCountDisplay.style.display = "inline-block";
	cartCountDisplay.textContent = localStorage.cartCount;
}

/* Function to get Query Parameters from URL */
const getQueryStringParameters = url => {
	if (url){
		if(url.split("?").length > 0){
			query = url.split("?")[1];
		}
	}else{
		url = window.location.href;
		query = window.location.search.substring(1);
	}
	return (/^[?#]/.test(query) ? query.slice(1) : query)
	.split('&')
	.reduce((params, param) => {
		let [ key, value ] = param.split('=');
		params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
		return params;
	}, { });
};

/* Function to make API requests */
function makeRequest(verb, url, data) {
	return new Promise((resolve,reject) => {
		let request = new XMLHttpRequest();
		request.open(verb, url);
		request.onreadystatechange = () => {
			if(request.readyState === 4) {
				if(request.status === 200 || request.status === 201){
					resolve(JSON.parse(request.response));
				} else {
					reject(JSON.parse(request.response));
				}
			}
		}
		if(verb == "POST") {
			request.setRequestHeader('Content-Type', 'application/json');
			request.send(data);
		} else {
			request.send();
		}
	});
}

/* Display all products on list view page */
async function showAllProducts() {
	const promise = makeRequest('GET', apiUrl);
	const response = await promise;

	const loadingDiv = document.querySelector('.loading');
	const allItemsDiv = loadingDiv.parentNode;
	allItemsDiv.innerHTML = "";

	for(let i = 0; i < response.length; i++) {
		let itemImgDiv = document.createElement('div');
		itemImgDiv.classList.add('item-img');
		itemImgDiv.style.backgroundImage = "url('"+response[i].imageUrl+"')";

		let itemNameDiv = document.createElement('div');
		itemNameDiv.classList.add('item-name');
		itemNameDiv.textContent = response[i].name;

		let itemPriceDiv = document.createElement('div');
		itemPriceDiv.classList.add('item-price');
		itemPriceDiv.innerHTML = currencySymbol+response[i].price;

		let itemDiv = document.createElement('a');
		itemDiv.href = 'product.html?id='+response[i]._id;
		itemDiv.classList.add('item-div');
		itemDiv.classList.add('clearfix');

		itemDiv.appendChild(itemImgDiv);
		itemDiv.appendChild(itemNameDiv);
		itemDiv.appendChild(itemPriceDiv);

		let colDiv = document.createElement('div');
		colDiv.classList.add('col-lg-4');
		colDiv.classList.add('col-md-6');

		colDiv.appendChild(itemDiv);

		allItemsDiv.appendChild(colDiv);
	}
}

/* Get product of productId on Single product page */
async function getProduct(productId) {
	const promise = makeRequest('GET', apiUrl+'/'+productId);
	const response = await promise;

	const itemImg = document.querySelector('.item-img-lg');
	itemImg.src = response.imageUrl;

	const itemName = document.querySelector('h2');
	itemName.textContent = response.name;

	const itemPrice = document.querySelector('h4');
	itemPrice.innerHTML = currencySymbol+response.price;

	const itemCode = document.querySelector('.item-code');
	itemCode.textContent = productId;

	const itemDescription = document.querySelector('.item-desc');
	itemDescription.innerHTML = response.description;

	const itemSelect = document.querySelector('.item-select');
	const colors = response.colors;
	for (let i = 0; i < colors.length; i++) {
		let colorOption = document.createElement('option');
		colorOption.value = colors[i];
		colorOption.textContent = colors[i];
		itemSelect.appendChild(colorOption);
	}

	const productDiv = document.querySelector('.product-container');
	productDiv.style.visibility = 'visible';
}


/* Function to disable "Add to cart" button and display links for cart and continue shopping */
function disableCartButton() {
	const btnAddToCart = document.querySelector('.btn-add-to-cart');

	/* Disable the "Add to cart" button and change text to "Added to cart" */
	btnAddToCart.textContent = "Added to cart";
	btnAddToCart.classList.remove('btn-dark');
	btnAddToCart.classList.add('btn-light');
	btnAddToCart.disabled = "disabled";

	/* Display options to go to cart or continue shopping */
	document.querySelector('.added-to-cart-display').style.display = "block";
}

/* Function to enable "Add to cart" button and remove links for cart and continue shopping */
function enableCartButton() {
	const btnAddToCart = document.querySelector('.btn-add-to-cart');
	
	/* Enable the "Add to cart" button and change text */
	btnAddToCart.innerHTML = "<i class='fa fa-plus'></i> Add to cart";
	btnAddToCart.classList.add('btn-dark');
	btnAddToCart.classList.remove('btn-light');
	btnAddToCart.removeAttribute("disabled");

	/* Display options to go to cart or continue shopping */
	document.querySelector('.added-to-cart-display').style.display = "none";
}

/* If product already in cart, disable "Add to cart" button, show "Remove from cart" and display links for cart and continue shopping */
function checkProductInCart(productId) {
	if(localStorage.cartItems) {
		let itemsArray = JSON.parse(localStorage.cartItems, true);
		let isInCart = itemsArray.includes(productId);
		if(isInCart) {
			disableCartButton();
			const removeFromCart = document.querySelector('.remove-from-cart');
			removeFromCart.style.display = "inline-block";
		}
	}
}

/* Get product IDs array from local storage */
function getArrayOfProductIds() {
	if(localStorage.cartItems) {
		try {
			return JSON.parse(localStorage.cartItems, true);
		}
		catch(e) {
			return null;
		}
	} else {
		return null;
	}
}

function displayCartSummary(itemsArray) {
	if(itemsArray && itemsArray.length != 0) {

		/* If items in cart, display cart summary and contact form */
		populateCart();
		document.querySelector('.cart-div').style.display = "flex";
	} else {

		/* Else display empty cart message */
		document.querySelector('.empty-cart-div').style.display = "flex";
	}
}

/* Populate cart summary */
async function populateCart() {
	let grandTotal = 0;
	for(let i = 0; i < itemsArray.length; i++) {
		let productId = itemsArray[i];
		
		let promise = makeRequest('GET', apiUrl+'/'+productId);
		let response = await promise;
		
		let cartSummaryImage = document.createElement('img');
		cartSummaryImage.src = response.imageUrl;
		cartSummaryImage.classList.add('cart-summary-image');

		let cartImageLink = document.createElement('a');
		cartImageLink.href = 'product.html?id='+productId;
		cartImageLink.appendChild(cartSummaryImage);

		let cartSummaryName = document.createElement('div');
		cartSummaryName.classList.add('cart-summary-name');
		cartSummaryName.innerHTML = '<strong>'+response.name+'</strong>';

		let categoryDiv = document.createElement('div');
		categoryDiv.classList.add('small');
		categoryDiv.textContent = "Handmade Teddy Bears";

		let colDiv = document.createElement('div');
		colDiv.classList.add('col-auto');
		colDiv.appendChild(cartImageLink);
		colDiv.appendChild(cartSummaryName);
		colDiv.appendChild(categoryDiv);

		let priceDiv = document.createElement('div');
		priceDiv.classList.add('col-auto');
		priceDiv.classList.add('ml-auto');
		priceDiv.innerHTML = currencySymbol+response.price;

		let rowDiv = document.createElement('div');
		rowDiv.classList.add('row');
		rowDiv.classList.add('mb-3');
		rowDiv.appendChild(colDiv);
		rowDiv.appendChild(priceDiv);

		let cartSummaryDiv = document.querySelector('.cart-summary-products');
		cartSummaryDiv.appendChild(rowDiv);

		grandTotal += response.price;
	}
	let grandTotalDiv = document.querySelector('.grand-total');
	grandTotalDiv.innerHTML = currencySymbol+grandTotal;

	localStorage.grandTotal = grandTotal;
}


/* Function to process order - POST data to server, retrieve order ID and redirect to order confirmation page */
async function processOrder(data) {
	let promise = makeRequest('POST', apiUrl+'/order', data);
	let response = await promise;

	if(response.orderId) {
		window.location.href = "order-confirmation.html?orderId="+response.orderId;
	} else {
		window.location.href = "order-confirmation.html";
	}
}


/* Empty shopping cart */
function emptyShoppingCart() {
	localStorage.removeItem('cartCount');
	localStorage.removeItem('cartItems');
	const cartCountDisplay = document.querySelector('.cart-count');
	cartCountDisplay.textContent = 0;
	cartCountDisplay.style.display = "none";
}