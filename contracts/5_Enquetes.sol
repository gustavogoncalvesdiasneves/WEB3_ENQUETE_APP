// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

contract Enquete {
    struct OpcaoVoto {
        string descricao;
        uint256 quantidade;
    }

    struct EnqueteInfo {
        string titulo;
        address criador;
        bool ativa;
        OpcaoVoto[] opcoes;
        mapping (address => bool) jaVotou;
    }

    mapping (uint256 => EnqueteInfo) public enquetes;
    uint256 private contadorEnquete;

    // Enquete é criada <-- Event
    // Um Voto registrado <-- Event
    // Enquete encerrada <-- Event
    
    event enqueteCriada(uint256 idEnquete, string titulo, address criador);
    event votoRegistrado(uint256 idEnquete, uint256 indiceOpcao, address votante);
    event enqueteEncerrada(uint256 idEnquete, address criador);

    function criarEnquete(string memory _titulo, string[] memory _opcoes) external
    {
        require(_opcoes.length >= 2 && _opcoes.length <= 10, unicode"Deve-se incluir pelo menos 2 opções e no maximo 10 opões");
        contadorEnquete++;
        EnqueteInfo storage novaEnquete = enquetes[contadorEnquete];
        novaEnquete.titulo = _titulo;
        novaEnquete.criador = msg.sender;
        novaEnquete.ativa = true;

        for (uint256 i = 0; i < _opcoes.length; i++)
        {
            novaEnquete.opcoes.push(OpcaoVoto({descricao: _opcoes[i], quantidade: 0}));
        }

        emit enqueteCriada(contadorEnquete, _titulo, msg.sender);
    }

    function votar(uint256 _idEnquete, uint256 _indiceOpcao) external {
        EnqueteInfo storage enquete = enquetes[_idEnquete];
        require(enquete.ativa, unicode"Enquente esta encerrada");
        require(!enquete.jaVotou[msg.sender], unicode"Você ja votou");
        require(_indiceOpcao < enquete.opcoes.length, unicode"Escolha invalida");

        enquete.opcoes[_indiceOpcao].quantidade++;
        enquete.jaVotou[msg.sender] = true;

        emit votoRegistrado(_idEnquete, _indiceOpcao, msg.sender);
    }

    function encerrarEnquete(uint256 _idEnquete) external {
        EnqueteInfo storage enquete = enquetes[_idEnquete];
        require(enquete.ativa, unicode"Enquete ja foi encerrada");
        require(enquete.criador == msg.sender, unicode"Somente o criador pode encerrar a enquete");

        enquete.ativa = false;

        emit enqueteEncerrada(_idEnquete, msg.sender);
    }

    function obterEnquete(uint256 _idEnquete) external view returns (
        string memory titulo,
        bool ativa,
        string[] memory nomesOpcoes,
        uint256[] memory votosOpcoes
    ) {
        EnqueteInfo storage enquete = enquetes[_idEnquete];

        uint256 totalOpcoes = enquete.opcoes.length;
        nomesOpcoes = new string[](totalOpcoes);
        votosOpcoes = new uint256[](totalOpcoes);

        for (uint256 i = 0; i < totalOpcoes; i++ )
        {
            nomesOpcoes[i] = enquete.opcoes[i].descricao;
            votosOpcoes[i] = enquete.opcoes[i].quantidade;
        }

        return (enquete.titulo, enquete.ativa, nomesOpcoes, votosOpcoes);

    }
}

// for testing

// criar enquete:
// _titulo: "Qual Pão Prefere?"
// _opcoes: ["Pão de sal", "Pão de forma"]

// votar:
// _idEnquete: 1 <-- obter em "obterEnquete"
// _indiceOpcao: 0 <-- para "Pão de sal", 1 para "Pão de forma" (index)

// encerrarEnquete:
// _idEnquete: 1 obter em "obterEnquete" (somente quem criou a enquete pode encerrar)

// obterEnquete:
// _idEnquete: 1 <-- ou 0, depende da quantidade de enquetes

// =========== Melhorias =============
// fazer uma lista de carteiras que estão permitidas a criar enquetes
// fazer um button de received tokens para votar (tokens criado em BNB Smart chain Testnet)