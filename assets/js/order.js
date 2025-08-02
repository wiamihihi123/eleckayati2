// Vérification du panier au chargement
console.log('Démarrage du script order.js');
const cart = JSON.parse(localStorage.getItem('cart')) || [];
console.log('Contenu du panier:', cart);

if (cart.length === 0) {
    console.log('Le panier est vide, redirection vers la page panier');
    window.location.href = 'panier.html';
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé');
    
    const orderSummary = document.getElementById('order-summary');
    const orderSubtotal = document.getElementById('order-subtotal');
    const orderTotal = document.getElementById('order-total');
    const orderForm = document.getElementById('orderForm');
    const orderConfirmation = new bootstrap.Modal(document.getElementById('orderConfirmation'));
    const orderNumber = document.getElementById('order-number');
    const cartCountElement = document.getElementById('cart-count');

    // Fonction utilitaire pour formater les prix
    function formatPrice(price) {
        return parseFloat(price || 0).toFixed(2).replace('.', ',');
    }

    // Afficher le récapitulatif de la commande
    function displayOrderSummary() {
        console.log('Affichage du récapitulatif de la commande');
        console.log('Nombre d\'articles dans le panier:', cart.length);

        if (cart.length === 0) {
            console.log('Panier vide, redirection vers panier.html');
            window.location.href = 'panier.html';
            return;
        }

        let subtotal = 0;
        let html = '';

        cart.forEach((item, index) => {
            const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
            subtotal += itemTotal;

            html += `
                <div class="d-flex justify-content-between mb-2">
                    <div>
                        ${item.quantity} x ${item.name || 'Produit sans nom'}
                        ${item.brand ? `<br><small class="text-muted">${item.brand}</small>` : ''}
                    </div>
                    <div>${formatPrice(itemTotal)} dh</div>
                </div>
            `;
        });

        orderSummary.innerHTML = html;
        orderSubtotal.textContent = formatPrice(subtotal) + ' dh';
        orderTotal.textContent = formatPrice(subtotal) + ' dh';
        updateCartCount();
    }

    // Mettre à jour le compteur du panier
    function updateCartCount() {
        let totalItems = 0;
        cart.forEach(item => {
            totalItems += parseInt(item.quantity || 0);
        });
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }

    // Gérer la soumission du formulaire
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        console.log('Soumission du formulaire de commande');
        
        // Récupérer les données du formulaire
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            postalCode: document.getElementById('postalCode').value,
            city: document.getElementById('city').value,
            orderDetails: cart.map(item => ({
                name: item.name,
                brand: item.brand,
                price: item.price,
                quantity: item.quantity,
                total: (parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)
            })),
            subtotal: cart.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0).toFixed(2)
        };

        formData.total = formData.subtotal; // Total = sous-total (pas de frais de livraison)

        // Générer un numéro de commande
        const orderNum = 'CMD-' + Date.now().toString().substr(-8);
        orderNumber.textContent = orderNum;

        // Envoyer l'email (simulation avec SMTP.js)
        sendOrderEmail(formData, orderNum);

        // Afficher la confirmation
        orderConfirmation.show();

        // Vider le panier
        localStorage.removeItem('cart');
    });

    // Fonction pour envoyer l'email
    function sendOrderEmail(formData, orderNum) {
        console.log('Préparation de l\'envoi de l\'email');
        
        const emailBody = `
            <h2>Nouvelle commande #${orderNum}</h2>
            <h3>Informations client :</h3>
            <p><strong>Nom :</strong> ${formData.firstName} ${formData.lastName}</p>
            <p><strong>Email :</strong> ${formData.email}</p>
            <p><strong>Téléphone :</strong> ${formData.phone}</p>
            <p><strong>Adresse :</strong> ${formData.address}, ${formData.postalCode} ${formData.city}</p>
            
            <h3>Détails de la commande :</h3>
            <table border="1" cellpadding="5" cellspacing="0" width="100%">
                <tr>
                    <th>Produit</th>
                    <th>Marque</th>
                    <th>Prix unitaire</th>
                    <th>Quantité</th>
                    <th>Total</th>
                </tr>
                ${formData.orderDetails.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.brand || 'N/A'}</td>
                        <td>${item.price} dh</td>
                        <td>${item.quantity}</td>
                        <td>${item.total} dh</td>
                    </tr>
                `).join('')}
                <tr>
                    <td colspan="4" style="text-align: right;"><strong>Total :</strong></td>
                    <td><strong>${formData.total} dh</strong></td>
                </tr>
            </table>
        `;

        console.log('Corps de l\'email préparé');

        // Configuration pour SMTP.js (version de test)
        console.log('Envoi de l\'email...');
        Email.send({
            SecureToken: "votre_secure_token", // À remplacer par votre token SMTP.js
            To: 'wiamihihi038@gmail.com',
            From: 'votre-email@votredomaine.com', // Votre email vérifié
            Subject: `Nouvelle commande #${orderNum}`,
            Body: emailBody,
            IsHtml: true
        }).then(
            message => {
                console.log('Email envoyé avec succès:', message);
                // Afficher la confirmation
                orderConfirmation.show();
                // Vider le panier après l'envoi réussi
                localStorage.removeItem('cart');
            }
        ).catch(
            error => {
                console.error('Erreur lors de l\'envoi de l\'email:', error);
                alert('Une erreur est survenue lors de l\'envoi de la commande. Veuillez réessayer.');
            }
        );
    }

    // Initialisation
    console.log('Initialisation de la page de commande');
    displayOrderSummary();
});