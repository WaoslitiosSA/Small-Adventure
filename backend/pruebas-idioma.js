
const { franc } = require("franc");

const textos = [
    "Buenos días, ¿cómo estás hoy? Me gusta mucho jugar aventuras y explorar nuevos mundos con mis amigos. Espero que tengas una excelente semana.",
    "Good morning, how are you today? I really enjoy playing adventure games and exploring new worlds with my friends. I hope you have an excellent week.",
    "Bom dia, como você está hoje? Eu gosto muito de jogar aventuras e explorar novos mundos com meus amigos. Espero que você tenha uma excelente semana."
];

textos.forEach(function (texto) {
    const idioma = franc(texto, { minLength: 10 });

    console.log("Texto:");
    console.log(texto);

    console.log("Idioma detectado:");
    console.log(idioma);

    console.log("-------------------------");
});
