document.addEventListener('DOMContentLoaded', function() {
    // Récupérer le panier depuis le localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartCountElement = document.getElementById('cart-count');

    // Fonction utilitaire pour formater les prix
    const formatPrice = (price) => {
        return parseFloat(price || 0).toFixed(2).replace('.', ',');
    };

    // Afficher les articles du panier
    function displayCartItems() {
        if (!cart || cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItemsContainer.innerHTML = '';
            cartItemsContainer.appendChild(emptyCartMessage);
            checkoutBtn.disabled = true;
            updateCartCount();
            return;
        }

        emptyCartMessage.style.display = 'none';
        cartItemsContainer.innerHTML = '';
        
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'row align-items-center cart-item';
            
            itemElement.innerHTML = `
                <div class="col-md-6">
                    <h6 class="mb-1">${item.name || 'Produit sans nom'}</h6>
                    <small class="text-muted">${item.brand || 'Marque non spécifiée'}</small>
                </div>
                <div class="col-md-3">
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="updateQuantity(${index}, ${(item.quantity || 1) - 1})">-</button>
                        <input type="number" class="form-control text-center" 
                               value="${item.quantity || 1}" min="1" 
                               onchange="updateQuantity(${index}, this.value)">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="updateQuantity(${index}, ${(item.quantity || 1) + 1})">+</button>
                    </div>
                </div>
                <div class="col-md-2 text-end">
                    <span class="fw-bold">${formatPrice((item.price || 0) * (item.quantity || 1))} dh</span>
                </div>
                <div class="col-md-1 text-end">
                    <button class="btn btn-link text-danger" 
                            onclick="removeFromCart(${index})"
                            title="Supprimer du panier">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        updateCartTotal();
        updateCartCount();
    }

    // Mettre à jour la quantité d'un article
    window.updateQuantity = function(index, newQuantity) {
        if (index < 0 || index >= cart.length) return;
        
        newQuantity = parseInt(newQuantity);
        if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
        
        cart[index].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    }

    // Supprimer un article du panier
    window.removeFromCart = function(index) {
        if (index < 0 || index >= cart.length) return;
        
        if (confirm('Voulez-vous vraiment supprimer cet article du panier ?')) {
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCartItems();
        }
    }

    // Mettre à jour le total du panier
    function updateCartTotal() {
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += (item.price || 0) * (item.quantity || 1);
        });

        subtotalElement.textContent = formatPrice(subtotal) + ' €';
        totalElement.textContent = formatPrice(subtotal) + ' €';
        checkoutBtn.disabled = cart.length === 0;
    }

    // Mettre à jour le compteur du panier
    function updateCartCount() {
        let totalItems = 0;
        cart.forEach(item => {
            totalItems += parseInt(item.quantity || 0);
        });
        cartCountElement.textContent = totalItems;
    }

    // Initialisation
    displayCartItems();

    // Gérer le bouton de commande
    checkoutBtn.addEventListener('click', function() {
        if (cart.length > 0) {
            // Rediriger vers la page de commande
            window.location.href = 'commande.html';
        }
    });
});