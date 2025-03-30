// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

contract CaixaEntrada {
    string public mensagem;

    constructor(string memory mensagemPassed){
        mensagem = mensagemPassed;
    }

    function setMensagem(string memory newMessagem) public {
        mensagem = newMessagem;
    }

    function getMensagem() public view returns (string memory){
        return mensagem;
    }
}