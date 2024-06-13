import { CreateWebWorkerMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

alert(".");
const $ = (element)=> document.querySelector(element);

const MODELS = [{
    'id': 'stablelm-2-zephyr-1_6b-q4f16_1-MLC-1k',
    'nombre': 'Stablelm 2 LITE',
    },
    {
    'id': 'stablelm-2-zephyr-1_6b-q4f32_1-MLC',
    'nombre': 'Stablelm 2',
    },
    {
    'id': 'Llama-3-8B-Instruct-q4f16_1-MLC-1k',
    'nombre': 'Llama 3 LITE',
    },
    {
    'id': 'Llama-3-8B-Instruct-q4f32_1-MLC',
    'nombre': 'Llama 3'
    }
]

const urlParams = new URLSearchParams(window.location.search);
const modelo = parseInt(urlParams.get('modelo') ?? 0);

const SELECTED_MODEL = MODELS[modelo];
const $info = $('#model-download')

const $form = $('form');
const $input = $('input');
const $template = $('#template-msg');
const $msg = $('ul');
const $container = $('main');
const $button = $('button');
const $cmbModelos = $('#cmb-modelos');

MODELS.forEach((item, i) => {
    $cmbModelos.innerHTML += `
        <option value=${i} ${modelo === i ? 'selected' : ''}>${item.nombre}</option>
    `
});
$cmbModelos.addEventListener('change', (e)=>{
    location.href = `?modelo=${e.target.value}`;
})


const msgText = 'Hola, mi nombre es Agustin ¿en que puedo ayudarte? ';
let messages = [];
messages.push({
    role: 'assistant',
    content: `
    ${msgText}
        Respuestas a preguntas frecuentes: 
        Sobre mi: Mi nombré es Agustin Fizzano tengo ${calcularEdad()} años, nací y vivo en Buenos Aires, Argentina, soy analista de sistemas y desarrollador web. Descubri mi pasion por la programación desde muy pequeño, a los 10 años, cuando quise saber como se programaban los videojuegos.
        Tecnologías que manejo: Web stack: "| HTML | CSS | React.js | Next.js |", Desktop stack: "| C# | .NET Framework | SQL Server |"
        Intereses: "programación, videjuegos, la cocína, la informática"
        Redes y contacto: {
            EMail (correo electronico): agustin_fizzano@hotmail.com
            Linkedin: https://www.linkedin.com/in/agustin-fizzano/
            Github: https://github.com/TutozGhub/
            Sitio Web: https://tutoz.site/
        }
        **NO VOY A INCLUIR NINGUNA TECNOLOGÍA NI DATO ADICIONAL A LOS MENCIONADOS**
        **VOY A DAR RESPUESTAS BREVES**
        **NO VOY A MENCIONAR QUE YA HABLÉ O MENCIONE PREVIAMENTE DE UN TEMA**
        **NO VOY A USAR LA EXPRESIÓN "Como ya mencioné", "Como te mencioné", "Como mencioné anteriormente" O CUALQUIER DIALOGO QUE EXPRESE QUE YA HE DICHO ALGO PREVIAMENTE**
    `
})
addMessage(msgText, 'bot');

const engine = await CreateWebWorkerMLCEngine(
    new Worker('js/worker.js', {type: "module"}),
    SELECTED_MODEL.id,
    {
        initProgressCallback: (info) =>{
            $info.textContent = `${info.text}`;

            const $data = $('#model-data');
            $data.textContent = `${SELECTED_MODEL.nombre}`

            if (info.progress === 1){
                $button.removeAttribute('disabled');
            }
        }
    }
)

$form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const msgText = $input.value.trim();
    if (msgText === ''){
        return;
    }
    $input.value = '';
    addMessage(msgText, 'user');

    $button.setAttribute('disabled', true);

    messages.push({
        role: 'user',
        content: `${msgText}`
    });

    let reply = "";
    const chunks = await engine.chat.completions.create({
        messages,
        stream: true
    })

    const $botMsg = addMessage("", 'bot');

    for await (const chunk of chunks){
        const content = chunk?.choices[0]?.delta?.content ?? "";
        reply += content;
        const splits = reply.split('\n');
        $botMsg.innerHTML = ''
        splits.forEach(item => {
            $botMsg.innerHTML += `
                <p>${item}</p>
            `
        });
        $container.scrollTop = $container.scrollHeight;
    }

    $button.removeAttribute('disabled');

    messages.push({
        role: 'assistant',
        content: reply
    });
    if (messages.length >= 20){ messages.splice(1, 1)};
});

function addMessage(text, sender){
    const clonnedTemplate = $template.content.cloneNode(true);
    const $newMsg = clonnedTemplate.querySelector('.msg');
    
    const $who = $newMsg.querySelector('span');
    const $div = $newMsg.querySelector('div');
    const $text = $div.querySelector('p');

    $who.textContent = sender === 'bot' ? "" : "";
    $text.textContent = text;

    $newMsg.classList.add(sender);
    $msg.appendChild($newMsg);

    $container.scrollTop = $container.scrollHeight;

    // LOG
    // console.log(messages);

    return $div;
}

function calcularEdad()
{
    const fecha1 = "2003-04-09";
    const fecha2 = Date.now();
    const diff = Math.abs(new Date(fecha2) - new Date(fecha1));
    const years = parseInt((diff / 31556926) / 1000);
    return years;
}
