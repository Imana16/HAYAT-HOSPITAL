const medicineContainer = document.getElementById('medicine-category');
const cart = [];

// Load medicines when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadMedicines();
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    displayCartSummary(cartData);
});

// Add event listeners
const saveFavoritesButton = document.getElementById('save-favorites');
if (saveFavoritesButton) saveFavoritesButton.addEventListener('click', saveFavorites);

const applyFavoritesButton = document.getElementById('apply-favorites');
if (applyFavoritesButton) applyFavoritesButton.addEventListener('click', applyFavorites);

const buyNowButton = document.getElementById('buy-now');
if (buyNowButton) buyNowButton.addEventListener('click', proceedToCheckout);

function loadMedicines() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout after 10 seconds

    fetch('./medicine.json', { signal: controller.signal })
        .then(response => {
            clearTimeout(timeoutId); // Clear timeout if fetch is successful
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`Failed to load medicines: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Medicine data fetched:', data);
            displayMedicines(data);
        })
        .catch(error => {
            if (error.name === 'AbortError') {
                console.error('Request timed out');
                alert('Request timed out. Please try again later.');
            } else {
                console.error('Error loading medicines:', error);
                alert('Failed to load medicines. Please try again later.');
            }
        });
}

function displayMedicines(data) {
    if (!medicineContainer) {
        console.error('Medicine container not found!');
        return;
    }

    data.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');

        const categoryHeading = document.createElement('h3');
        categoryHeading.classList.add('category-heading');
        categoryHeading.textContent = category.category;
        categoryDiv.append(categoryHeading);

        const medicineListDiv = document.createElement('div');
        medicineListDiv.classList.add('medicine-list');

        category.items.forEach(item => {
            const medicineItemDiv = document.createElement('div');
            medicineItemDiv.classList.add('medicine-item');

            medicineItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="medicine-image">
                <p class="medicine-name">${item.name}</p>
                <p class="medicine-price">LKR ${item.price}</p>
                <input type="number" min="1" value="1" id="${item.name}-qty" class="medicine-quantity">
                <button class="add-to-cart-btn" data-name="${item.name}" data-price="${item.price}" data-id="${item.name}-qty">Add to Cart</button>
            `;

            const addToCartButton = medicineItemDiv.querySelector('.add-to-cart-btn');
            if (addToCartButton) {
                addToCartButton.addEventListener('click', (e) => {
                    const { name, price, id } = e.target.dataset;
                    addToCart(name, parseFloat(price), id);
                });
            }

            medicineListDiv.append(medicineItemDiv);
        });

        categoryDiv.append(medicineListDiv);
        medicineContainer.append(categoryDiv);
    });
}

function addToCart(name, price, qtyInputId) {
    const qtyInput = document.getElementById(qtyInputId);
    if (!qtyInput) {
        alert('Quantity input not found');
        return;
    }

    const qty = parseInt(qtyInput.value);
    if (qty <= 0) {
        alert("Quantity must be at least 1");
        return;
    }

    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ name, price, qty });
    }
    displayCart();
}

function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) {
        console.error('Cart items container not found!');
        return;
    }

    cartItemsContainer.innerHTML = '';
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const total = item.price * item.qty;
        grandTotal += total;

        cartItemsContainer.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${item.qty}</td>
                <td>${total.toFixed(2)}</td>
                <td><button class="remove-item" data-index="${index}">Remove</button></td>
            </tr>
        `;
    });

    const grandTotalElement = document.getElementById('grand-total');
    if (grandTotalElement) {
        grandTotalElement.textContent = grandTotal.toFixed(2);
    }

    document.querySelectorAll('.remove-item').forEach(button =>
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            removeFromCart(index);
        })
    );
}

function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
}

function saveFavorites() {
    if (cart.length === 0) {
        alert('Nothing was added to the cart');
        return;
    }
    localStorage.setItem('favorites', JSON.stringify(cart));
    alert('Favorites Saved!');
}

function applyFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites'));
    if (favorites) {
        favorites.forEach(item => {
            const existingItem = cart.find(cartItem => cartItem.name === item.name);
            if (existingItem) {
                existingItem.qty += item.qty;
            } else {
                cart.push(item);
            }
        });
        displayCart();
    } else {
        alert('No Favorites Saved!');
    }
}

function proceedToCheckout() {
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Proceeding to Checkout...');
    window.location.href = './checkout.html';
}

function displayCartSummary(cart) {
    const cartItemsContainer = document.getElementById('cart-items-summary');
    const grandTotalElement = document.getElementById('grand-total');
    if (!cartItemsContainer || !grandTotalElement) {
        console.error('Cart summary elements not found!');
        return;
    }
     // Clear previous content to avoid duplication
    cartItemsContainer.innerHTML = ''; 
    
    let grandTotal = 0;

    cart.forEach(item => {
        const total = item.price * item.qty;
        grandTotal += total;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${item.qty}</td>
            <td>${total.toFixed(2)}</td>
        `;
        cartItemsContainer.append(row);
    });

    grandTotalElement.textContent = grandTotal.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    displayCartSummary(cartData);

    
    }
);

document.getElementById('pay-button').addEventListener('click', handlePayment);

function handlePayment() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const postalCode = document.getElementById('postal-code').value.trim();
    const cardNumber = document.getElementById('credit-card').value.trim();
    const expiryDate = document.getElementById('expiry-date').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    // Validation for empty fields
    if (!name) return alert('Please enter your full name.');
    if (!email) return alert('Please enter your email address.');
    if (!phone.match(/^\d{10}$/)) return alert('Please enter a valid 10-digit phone number.');
    if (!address) return alert('Please enter your shipping address.');
    if (!city) return alert('Please enter your city.');
    if (!postalCode.match(/^\d{5}$/)) return alert('Please enter a valid 5-digit postal code.');
    if (!cardNumber.match(/^\d{16}$/)) return alert('Please enter a valid 16-digit credit card number.');
    if (!expiryDate) return alert('Please select the card expiry date.');
    if (!cvv.match(/^\d{3}$/)) return alert('Please enter a valid 3-digit CVV.');

    // Calculate delivery date (5 days from today)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    // Show confirmation popup
    const confirmationPopup = document.getElementById('confirmation-popup');
    const confirmationMessage = document.getElementById('confirmation-message');
    confirmationMessage.textContent = `Payment successful! Your order will be delivered on ${deliveryDate.toDateString()}.`;
    confirmationPopup.classList.remove('hidden');

    // Overlay for popup
    overlay.addEventListener('click', () => {
        confirmationPopup.classList.add('hidden');
        overlay.classList.add('hidden');
    });
    

    // Clear the cart (if implemented in localStorage)
    localStorage.removeItem('cart');

    // Handle return button
    document.getElementById('return-button').addEventListener('click', () => {
        confirmationPopup.classList.add('hidden');
        overlay.classList.add('hidden');
        window.location.href = './medicine.html'; // Redirects to the pharmacy page
    });
    
}




const menuToggle = document.getElementById('menu-toggle');
 const navList = document.getElementById('nav-list');
 
 menuToggle.addEventListener('click', function() {
     navList.classList.toggle('show');
 });