document.addEventListener('DOMContentLoaded', function() {
    // Récupérer le panier depuis le localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Récupérer les éléments du DOM avec des vérifications
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Fonction pour mettre à jour le compteur du panier
    function updateCartCount() {
        let totalItems = 0;
        cart.forEach(item => {
            totalItems += parseInt(item.quantity || 0);
        });
        
        // Mettre à jour tous les badges de compteur de panier
        const cartBadges = document.querySelectorAll('.navbar .badge:not(.visually-hidden)');
        cartBadges.forEach(badge => {
            // Trouver le span qui contient le nombre (celui qui n'a pas la classe visually-hidden)
            const countSpan = Array.from(badge.childNodes).find(node => 
                node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''
            );
            
            if (countSpan) {
                countSpan.textContent = totalItems;
                // Afficher ou masquer le badge selon le nombre d'articles
                badge.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        });
    }

    // Fonction utilitaire pour formater les prix
    const formatPrice = (price) => {
        return parseFloat(price || 0).toFixed(2).replace('.', ',');
    };

    // Afficher les articles du panier
    function displayCartItems() {
        if (!cartItemsContainer) return;
        
        if (!cart || cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (checkoutBtn) checkoutBtn.disabled = true;
            updateCartCount();
            return;
        }

        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        
        let html = '';
        cart.forEach((item, index) => {
            html += `
                <div class="cart-item">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" class="img-fluid">
                        </div>
                        <div class="col-md-4">
                            <h6 class="mb-1">${item.name || 'Produit sans nom'}</h6>
                            <p class="text-muted mb-0">${item.brand || 'Marque non spécifiée'}</p>
                        </div>
                        <div class="col-md-3">
                            <div class="input-group">
                                <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${index}, ${(item.quantity || 1) - 1})">-</button>
                                <input type="number" class="form-control form-control-sm text-center" value="${item.quantity || 1}" min="1" onchange="updateQuantity(${index}, this.value)">
                                <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${index}, ${(item.quantity || 1) + 1})">+</button>
                            </div>
                        </div>
                        <div class="col-md-2 text-end">
                            <div class="fw-bold">${formatPrice((item.price || 0) * (item.quantity || 1))} dh</div>
                            <small class="text-muted">${formatPrice(item.price || 0)} dh l'unité</small>
                        </div>
                        <div class="col-md-1 text-end">
                            <button class="btn btn-link text-danger" onclick="removeFromCart(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = html;
        updateCartTotal();
        updateCartCount();
    }

    // Mettre à jour la quantité d'un article
    window.updateQuantity = function(index, newQuantity) {
        newQuantity = parseInt(newQuantity);
        if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
        
        if (index >= 0 && index < cart.length) {
            cart[index].quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCartItems();
        }
    }

    // Supprimer un article du panier
    window.removeFromCart = function(index) {
        if (index >= 0 && index < cart.length) {
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

        if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal) + ' dh';
        if (totalElement) totalElement.textContent = formatPrice(subtotal) + ' dh';
        if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
    }

    // Initialisation
    displayCartItems();

    // Gérer le bouton de commande
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                // Rediriger vers la page de commande
                window.location.href = 'commande.html';
            }
        });
    }
});