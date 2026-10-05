// State to track item quantities, prices, and image paths in cart
const cartData = {};

document.addEventListener('click', (event) => {
  const target = event.target;

  // 1. Clicked "Add to cart"
  const addToCartBtn = target.closest('.add-to-cart-btn');
  if (addToCartBtn) {
    const box = addToCartBtn.closest('.box');
    const boxImg = box.querySelector('.box_img');
    const quantityCounter = box.querySelector('.quantity-counter');
    const quantityDisplay = box.querySelector('.quantity-display');

    // Reset counter UI to 1 and reveal
    quantityDisplay.textContent = 1;
    addToCartBtn.classList.add('hidden');
    quantityCounter.classList.remove('hidden');

    // Add active border to image
    if (boxImg) boxImg.classList.add('active-border');

    // Extract item details
    const itemName = box.querySelector('.text2').textContent.trim();
    const itemPriceText = box.querySelector('.price').textContent.replace('$', '').trim();
    const itemPrice = parseFloat(itemPriceText);
    const imgSrc = boxImg ? boxImg.getAttribute('src') : '';

    // Save to cart data
    cartData[itemName] = {
      price: itemPrice,
      count: 1,
      imgSrc: imgSrc,
      boxRef: box
    };

    updateCartUI();
    return;
  }

  // 2. Clicked Plus (+) or Minus (-) button
  const btnCounter = target.closest('.btn-counter');
  if (btnCounter) {
    const box = btnCounter.closest('.box');
    const boxImg = box.querySelector('.box_img');
    const addToCartBtn = box.querySelector('.add-to-cart-btn');
    const quantityCounter = box.querySelector('.quantity-counter');
    const quantityDisplay = box.querySelector('.quantity-display');
    const itemName = box.querySelector('.text2').textContent.trim();

    let currentCount = parseInt(quantityDisplay.textContent, 10) || 1;
    const isPlus = btnCounter.classList.contains('plus-btn');

    if (isPlus) {
      currentCount++;
    } else {
      currentCount--;
    }

    if (currentCount <= 0) {
      // Revert to "Add to cart", remove border, and remove from cart state
      quantityCounter.classList.add('hidden');
      addToCartBtn.classList.remove('hidden');
      if (boxImg) boxImg.classList.remove('active-border');

      delete cartData[itemName];
    } else {
      quantityDisplay.textContent = currentCount;
      quantityDisplay.classList.add('bump');
      setTimeout(() => quantityDisplay.classList.remove('bump'), 150);

      if (cartData[itemName]) {
        cartData[itemName].count = currentCount;
      }
    }

    updateCartUI();
    return;
  }

  // 3. Clicked Item Remove (x) Button inside Cart
  const removeBtn = target.closest('.remove-item-btn');
  if (removeBtn) {
    const itemName = removeBtn.getAttribute('data-name');
    if (cartData[itemName]) {
      resetItemInGrid(itemName);
      updateCartUI();
    }
    return;
  }

  // 4. Clicked "Confirm Order" Button
  const confirmBtn = target.closest('.confirm-btn');
  if (confirmBtn) {
    showOrderModal();
    return;
  }

  // 5. Clicked "Start New Order" Button inside Modal
  const newOrderBtn = target.closest('#newOrderBtn');
  if (newOrderBtn) {
    resetAllOrders();
  }
});

// Function to render cart items and calculate total
function updateCartUI() {
  const cartEmpty = document.getElementById('cartEmpty');
  const cartSelected = document.getElementById('cartSelected');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalCount = document.getElementById('cartTotalCount');
  const cartHeaderCount = document.getElementById('cartHeaderCount');
  const orderTotalPrice = document.getElementById('orderTotalPrice');

  const itemKeys = Object.keys(cartData);
  let totalItemCount = 0;
  let totalOrderPrice = 0;

  if (itemKeys.length === 0) {
    cartEmpty.classList.remove('hidden');
    cartSelected.classList.add('hidden');
    cartTotalCount.textContent = '0';
    return;
  }

  cartEmpty.classList.add('hidden');
  cartSelected.classList.remove('hidden');

  let itemsHTML = '';

  itemKeys.forEach((name) => {
    const item = cartData[name];
    const itemTotal = item.price * item.count;
    totalItemCount += item.count;
    totalOrderPrice += itemTotal;

    itemsHTML += `
      <div class="cart-item">
        <div class="cart-item-details">
          <p class="cart-item-name">${name}</p>
          <div class="cart-item-meta">
            <span class="cart-item-count">${item.count}x</span>
            <span class="cart-item-unit-price">@ $${item.price.toFixed(2)}</span>
            <span class="cart-item-total-price">$${itemTotal.toFixed(2)}</span>
          </div>
        </div>
        <button class="remove-item-btn" data-name="${name}" aria-label="Remove item">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
            <path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/>
          </svg>
        </button>
      </div>
    `;
  });

  cartItemsList.innerHTML = itemsHTML;
  cartTotalCount.textContent = totalItemCount;
  cartHeaderCount.textContent = totalItemCount;
  orderTotalPrice.textContent = `$${totalOrderPrice.toFixed(2)}`;
}

// Populate and display the Order Confirmed Modal
function showOrderModal() {
  const modal = document.getElementById('orderModal');
  const modalItemsList = document.getElementById('modalItemsList');
  const modalTotalPrice = document.getElementById('modalTotalPrice');

  const itemKeys = Object.keys(cartData);
  let modalItemsHTML = '';
  let grandTotal = 0;

  itemKeys.forEach((name) => {
    const item = cartData[name];
    const itemTotal = item.price * item.count;
    grandTotal += itemTotal;

    modalItemsHTML += `
      <div class="modal-item">
        <img src="${item.imgSrc}" alt="${name}" class="modal-item-thumb">
        <div class="modal-item-info">
          <p class="modal-item-name">${name}</p>
          <div class="modal-item-meta">
            <span class="modal-item-count">${item.count}x</span>
            <span class="modal-item-unit-price">@ $${item.price.toFixed(2)}</span>
          </div>
        </div>
        <span class="modal-item-total">$${itemTotal.toFixed(2)}</span>
      </div>
    `;
  });

  modalItemsList.innerHTML = modalItemsHTML;
  modalTotalPrice.textContent = `$${grandTotal.toFixed(2)}`;
  modal.classList.remove('hidden');
}

// Reset an individual product card back to default state
function resetItemInGrid(itemName) {
  if (cartData[itemName]) {
    const box = cartData[itemName].boxRef;
    const addToCartBtn = box.querySelector('.add-to-cart-btn');
    const quantityCounter = box.querySelector('.quantity-counter');
    const boxImg = box.querySelector('.box_img');

    quantityCounter.classList.add('hidden');
    addToCartBtn.classList.remove('hidden');
    if (boxImg) boxImg.classList.remove('active-border');

    delete cartData[itemName];
  }
}

// Reset the entire application when starting a new order
function resetAllOrders() {
  Object.keys(cartData).forEach((itemName) => {
    resetItemInGrid(itemName);
  });

  updateCartUI();
  document.getElementById('orderModal').classList.add('hidden');
}