let i = 0;
const text = "Welcome To Portfolio Management";
const typingSpeed = 200;
const pauseDuration = 3000;
let activeTimeout = null;
let isActive = false;

export default function typeWriter() {
    // If already running, clean up first
    if (isActive) {
        if (activeTimeout) {
            clearTimeout(activeTimeout);
        }
        const typingElement = document.getElementById("typing");
        if (typingElement) {
            typingElement.innerHTML = '';
        }
        i = 0;
    }

    isActive = true;
    const typingElement = document.getElementById("typing");
    if (!typingElement) return;
    
    function type() {
        if (!typingElement || !isActive) return;
        
        if (i < text.length) {
            typingElement.innerHTML += text.charAt(i);
            i++;
            activeTimeout = setTimeout(type, typingSpeed);
        } else {
            activeTimeout = setTimeout(() => {
                if (typingElement && isActive) {
                    typingElement.innerHTML = '';
                    i = 0;
                    type();
                }
            }, pauseDuration);
        }
    }
    
    type();
    

    return () => {
        isActive = false;
        if (activeTimeout) {
            clearTimeout(activeTimeout);
        }
        if (typingElement) {
            typingElement.innerHTML = '';
        }
        i = 0;
    };
}