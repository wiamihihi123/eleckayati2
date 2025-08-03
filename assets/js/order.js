// Vérification du panier au chargement
console.log('Démarrage du script order.js');
let cart = JSON.parse(localStorage.getItem('cart')) || [];
console.log('Contenu du panier:', cart);

if (cart.length === 0) {
    console.log('Le panier est vide, redirection vers la page panier');
    window.location.href = 'panier.html';
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé');
    
    // Éléments du DOM
    const orderSummary = document.getElementById('order-summary');
    const orderSubtotal = document.getElementById('order-subtotal');
    const orderTotal = document.getElementById('order-total');
    const orderForm = document.getElementById('orderForm');
    const orderNumber = document.getElementById('order-number');
    const cartCountElement = document.getElementById('cart-count');
    
    // Initialisation de la modale Bootstrap
    let orderConfirmation;
    const modalElement = document.getElementById('orderConfirmation');
    if (modalElement) {
        orderConfirmation = new bootstrap.Modal(modalElement);
    }

    // Fonction utilitaire pour formater les prix
    function formatPrice(price) {
        return parseFloat(price || 0).toFixed(2).replace('.', ',');
    }

    // Mettre à jour le compteur du panier
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCountElements = document.querySelectorAll('.cart-count, #cart-count');
        const totalItems = cart.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
        
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
    }

    // Afficher le récapitulatif de la commande
    function displayOrderSummary() {
        console.log('Affichage du récapitulatif de la commande');
        
        if (cart.length === 0) {
            console.log('Panier vide, redirection vers panier.html');
            window.location.href = 'panier.html';
            return;
        }

        let subtotal = 0;
        let html = '';

        cart.forEach(item => {
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

    // Gérer la soumission du formulaire
    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Soumission du formulaire de commande');
        
        // Désactiver le bouton de soumission
        const submitButton = orderForm.querySelector('button[type="submit"]') || 
        orderForm.querySelector('.btn-primary') || 
        orderForm.querySelector('button');
 if (!submitButton) {
            console.error('Bouton de soumission non trouvé');
            return;
        }
        
        try {
            
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Traitement...';
       
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
            formData.total = formData.subtotal;

            // Générer un numéro de commande
            const orderNum = 'CMD-' + Date.now().toString().substr(-8);
            orderNumber.textContent = orderNum;

            // Envoyer l'email
            await sendOrderEmail(formData, orderNum);
            
            // Afficher la confirmation
            orderConfirmation.show();
            
            // Rediriger après 5 secondes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 5000);

        } catch (error) {
            console.error('Erreur lors du traitement de la commande:', error);
            alert('Une erreur est survenue lors du traitement de votre commande. Veuillez réessayer.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Valider la commande';
        }
    });

    // Fonction pour envoyer l'email
    async function sendOrderEmail(formData, orderNum) {
        console.log('Préparation de l\'envoi de l\'email');
        
        // Créer le corps de l'email
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

        console.log('Envoi de l\'email...');
        
        // Version de test
        console.log('SIMULATION - Email envoyé avec succès');
        console.log('Destinataire:', 'wiamihihi038@gmail.com');
        console.log('Sujet:', `Nouvelle commande #${orderNum}`);
        console.log('Corps:', emailBody);
        
        // Vider le panier
        localStorage.removeItem('cart');
        updateCartCount();
        
        // Pour activer l'envoi d'email, décommentez le code ci-dessous
        /*
        return Email.send({
            SecureToken: "2197683e-261a-4859-98d4-9d9ea2212460",
            To: 'wiamihihi038@gmail.com',
            From: 'wiamihihi038@gmail.com',
            Subject: `Nouvelle commande #${orderNum}`,
            Body: emailBody,
            IsHtml: true
        });
        */
    }

    // Initialisation
    console.log('Initialisation de la page de commande');
    displayOrderSummary();
});