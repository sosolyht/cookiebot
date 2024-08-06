// frontend/src/Hidemyacc.ts

class Hidemyacc {
    async me() {
        const response = await fetch('http://127.0.0.1:2268/me');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }
}

export default Hidemyacc;
