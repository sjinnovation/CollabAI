let i = 0;
const text = "Welcome To Portfolio Management";
const speed = 100;

export default function typeWriter() {
    if (i < text.length) {
        document.getElementById("typing").innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
    } else {
        i = 0;
        document.getElementById("typing").innerHTML = '';
        setTimeout(typeWriter, speed * 2);
    }
}