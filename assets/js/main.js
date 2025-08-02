// Attendre que le DOM soit entièrement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du panier
    const cartCount = document.querySelector('.badge');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Mettre à jour le compteur du panier
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }
    
    // Initialiser le compteur du panier
    updateCartCount();
    
    // Gestion de l'ajout au panier
    const addToCartButtons = document.querySelectorAll('.btn-primary');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-primary') && 
                e.target.textContent.includes('Ajouter au panier')) {
                
                const card = e.target.closest('.card');
                const productName = card.querySelector('.card-title').textContent;
                const productPrice = card.querySelector('h5.mb-0').textContent;
                
                // Vérifier si le produit est déjà dans le panier
                const existingItem = cart.find(item => item.name === productName);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        name: productName,
                        price: productPrice,
                        quantity: 1
                    });
                }
                
                // Mettre à jour le stockage local
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Mettre à jour le compteur
                updateCartCount();
                
                // Afficher une notification
                showNotification('Produit ajouté au panier !');
            }
        });
    });
    
    // Fonction pour afficher les notifications
    function showNotification(message) {
        // Créer l'élément de notification s'il n'existe pas
        let notification = document.querySelector('.notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
            
            // Ajouter des styles à la notification
            const style = document.createElement('style');
            style.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: #28a745;
                    color: white;
                    padding: 15px 25px;
                    border-radius: 5px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 1000;
                }
                
                .notification.show {
                    transform: translateY(0);
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Afficher la notification
        notification.textContent = message;
        notification.classList.add('show');
        
        // Masquer la notification après 3 secondes
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Animation de défilement fluide pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animation au défilement
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.card, .animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Écouter l'événement de défilement
    window.addEventListener('scroll', animateOnScroll);
    
    // Initialiser les animations
    animateOnScroll();
});

// Fonction pour formater les prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(price);
}

// Fonction pour calculer le total du panier
function calculateCartTotal() {
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace(/[^0-9,]/g, '').replace(',', '.'));
        return total + (price * item.quantity);
    }, 0);
}
