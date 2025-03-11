const express = require('express');
const app = express();
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Perguntas e opções
const perguntas = [
    { id: 1, texto: "Qual é o seu consumo de fast food?", opcoes: ["Todos os dias", "De vez em quando", "Não consumo fast food"] },
    { id: 2, texto: "Qual é o seu consumo de bebidas alcoólicas?", opcoes: ["Todos os dias", "Casualmente", "Não consumo bebidas alcoólicas"] },
    { id: 3, texto: "Qual a frequência de atividades físicas?", opcoes: ["Não realizo atividades físicas", "Quando eu sinto dor", "Todos os dias"] },
    { id: 4, texto: "Qual é o seu consumo de legumes e verduras?", opcoes: ["Não consumo", "Só quando eu lembro", "Todos os dias"] },
    { id: 5, texto: "Qual é sua frequência de refrigerante?", opcoes: ["Quando tenho sede", "Em poucas ocasiões", "Não consumo refrigerante"] },
];

let respostas = [];

app.get('/', (req, res) => {
    respostas = [];
    res.redirect('/pergunta/1');
});

app.get('/pergunta/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const pergunta = perguntas.find(p => p.id === id);

    if (!pergunta) {
        return res.redirect('/resultado');
    }

    res.render('pergunta', { pergunta });
});

app.post('/responder', (req, res) => {
    const { id, resposta } = req.body;
    respostas.push(parseInt(resposta));

    const proximaPergunta = parseInt(id) + 1;
    if (proximaPergunta > perguntas.length) {
        return res.redirect('/resultado');
    }

    res.redirect(`/pergunta/${proximaPergunta}`);
});

app.get('/resultado', (req, res) => {
    let saudavel = 0;
    let neutro = 0;
    let nao_saudavel = 0;

    respostas.forEach((resposta, index) => {
        if (resposta === 0) nao_saudavel++;
        else if (resposta === 1) neutro++;
        else if (resposta === 2) saudavel++;
    });

    let categoria = '';
    let mensagem = '';
    let dicas = [];

    if (saudavel >= neutro && saudavel >= nao_saudavel) {
        categoria = 'Saudável 😁';
        mensagem = 'Parabéns! Você possui hábitos saudáveis.';
        dicas = ['Continue se alimentando bem!', 'Pratique exercícios regularmente.', 'Mantenha uma boa hidratação.'];
    } else if (neutro >= saudavel && neutro >= nao_saudavel) {
        categoria = 'Neutro 🤔';
        mensagem = 'Você tem alguns bons hábitos, mas há espaço para melhorias.';
        dicas = ['Reduza o fast food e refrigerantes.', 'Tente incluir mais verduras e legumes na alimentação.', 'Aumente a frequência de atividades físicas.'];
    } else {
        categoria = 'Menos Saudável 😔';
        mensagem = 'Atenção! Seus hábitos podem impactar negativamente sua saúde.';
        dicas = ['Evite fast food e bebidas açucaradas.', 'Pratique exercícios pelo menos 3 vezes por semana.', 'Busque orientação nutricional para melhorar sua alimentação.'];
    }

    res.render('resultado', { categoria, mensagem, dicas });
});

function calcularPontos(respostas) {
    const pesos = [
        [3, 2, 1], // Fast food
        [3, 2, 1], // Bebidas alcoólicas
        [3, 2, 1], // Atividades físicas (quanto mais, melhor)
        [3, 2, 1], // Legumes e verduras (quanto mais, melhor)
        [3, 2, 1]  // Refrigerante
    ];

    return respostas.reduce((total, resposta, index) => {
        return total + pesos[index][resposta];
    }, 0);
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
