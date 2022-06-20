export function valida(input) {
  const tipoInput = input.dataset.tipo;

  if (validadores[tipoInput]) {
    validadores[tipoInput](input);
  }

  if (input.validity.valid) {
    input.parentElement.classList.remove("input-container--invalido");
    input.parentElement.querySelector(".input-mensagem-erro").innerHTML = "";
  } else {
    input.parentElement.classList.add("input-container--invalido");
    input.parentElement.querySelector(".input-mensagem-erro").innerHTML =
      mostraMensagemErro(tipoInput, input);
  }
}

const tiposDeErro = [
  "valueMissing",
  "typeMismatch",
  "patternMismatch",
  "customError",
];

const mensagensDeErro = {
  nome: {
    valueMissing: "Este campo nome não pode estar vazio.",
  },
  email: {
    valueMissing: "Este campo email não pode estar vazio.",
    typeMismatch: "O email não é válido.",
  },
  senha: {
    valueMissing: "Este campo senha não pode estar vazio.",
    patternMismatch:
      "A senha deve conter entre 8 a 15 caracteres, e deve incluir pelo menos uma letra maiúscula, uma letra minúscula e um dígito numérico.",
  },
  dataNascimento: {
    valueMissing: "Este campo data de nascimento não pode estar vazio.",
    customError: "Você deve ser maior de 18 anos para se cadastrar.",
  },
  cpf: {
    valueMissing: "Este campo CPF não pode estar vazio.",
    customError: "O CPF digitado não é válido.",
  },
  cep: {
    valueMissing: "Este campo CEP não pode estar vazio.",
    patternMismatch: "O CEP digitado não é válido.",
    customError: "Não foi possível buscar o CEP.",
  },
  logrdouro: {
    valueMissing: "Este campo logradouro não pode estar vazio.",
  },
  cidade: {
    valueMissing: "Este campo cidade não pode estar vazio.",
  },
  estado: {
    valueMissing: "Este campo estado não pode estar vazio.",
  },
  preco: {
    valueMissing: "Este campo preço não pode estar vazio.",
  },
};

const validadores = {
  dataNascimento: (input) => validaDataNascimento(input),
  cpf: (input) => validaCPF(input),
  cep: (input) => recuperarCep(input),
};

function mostraMensagemErro(tipoDeInput, input) {
  let mensagem = "";

  tiposDeErro.forEach((erro) => {
    if (input.validity[erro]) {
      mensagem = mensagensDeErro[tipoDeInput][erro];
    }
  });

  return mensagem;
}

function validaDataNascimento(input) {
  const dataRecebida = new Date(input.value);
  let mensagem = "";

  if (!maiorQue18(dataRecebida)) {
    mensagem = "Você deve ser maior de 18 anos para se cadastrar.";
  }

  input.setCustomValidity(mensagem);
}

function maiorQue18(data) {
  const dataAtual = new Date();
  const dataMais18 = new Date(
    data.getFullYear() + 18,
    data.getMonth(),
    data.getDate()
  );

  return dataMais18 <= dataAtual;
}

function validaCPF(input) {
  const cpfFormatado = input.value.replace(/\D/g, "");
  let mensagem = "";

  if (!checaCpfRepetido(cpfFormatado) || !checaEstruturaCpf(cpfFormatado)) {
    mensagem = "O CPF digitado não é válido.";
  }

  input.setCustomValidity(mensagem);
}

function checaCpfRepetido(cpf) {
  const valoresRepetidos = [
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
  ];

  let cpfValido = true;

  valoresRepetidos.forEach((valor) => {
    if (valor == cpf) {
      cpfValido = false;
    }
  });

  return cpfValido;
}

function checaEstruturaCpf(cpf) {
  const multiplicador = 10;

  return checaDigitoVerificador(cpf, multiplicador);
}

function checaDigitoVerificador(cpf, multiplicador) {
  if (multiplicador >= 12) {
    return true;
  }

  let multiplicadorInicial = multiplicador;
  let soma = 0;

  const cpfSemDigito = cpf.substr(0, multiplicador - 1).split("");
  const digitoVerificador = cpf.charAt(multiplicador - 1);

  for (let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
    soma = soma + cpfSemDigito[contador] * multiplicadorInicial;
    contador++;
  }

  if (digitoVerificador == confirmaDigito(soma)) {
    return checaDigitoVerificador(cpf, multiplicador + 1);
  }

  return false;
}

function confirmaDigito(soma) {
  return 11 - (soma % 11);
}

function recuperarCep(input) {
  const cep = input.value.replace(/\D/g, "");
  const url = `https://viacep.com.br/ws/${cep}/json/`;
  const options = {
    method: "GET",
    mode: "cors",
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  };

  if (!input.validity.patternMismatch && !input.validity.valueMissing) {
    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        if (data.erro) {
          input.setCustomValidity("Não foi possível buscar o CEP.");
          return;
        }
        input.setCustomValidity("");
        preencheCamposComCep(data);
        return;
      });
  }
}

function preencheCamposComCep(data) {
  const logradouro = document.querySelector('[data-tipo="logradouro"]');
  const cidade = document.querySelector('[data-tipo="cidade"]');
  const estado = document.querySelector('[data-tipo="estado"]');

  logradouro.value = data.logradouro;
  cidade.value = data.localidade;
  estado.value = data.uf;
}
