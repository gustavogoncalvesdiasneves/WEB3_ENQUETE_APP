let contract;
let signer;
const contractAddress = "0x7b440240bc8ee05cf9bf1dfda6c8cc4aeaeccecf";
const contractABI = [
    "function criarEnquete(string memory _titulo, string[] memory _opcoes) external",
    "function votar(uint256 _idEnquete, uint256 _indiceOpcao) external",
    "function encerrarEnquete(uint256 _idEnquete) external",
    "function obterEnquete(uint256 _idEnquete) external view returns (string memory titulo, bool ativa, string[] memory nomesOpcoes, uint256[] memory votosOpcoes)",
    "function totalEnquetes() external view returns (uint256)"
];

async function connectWallet() {
    try {
        // Verifica se o MetaMask está instalado
        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask não encontrado. Abra o MetaMask no navegador ou baixe o aplicativo MetaMask!');
            return;
        }

        // Verifica se o MetaMask está disponível
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Solicita ao MetaMask acesso à conta do usuário
        await provider.send("eth_requestAccounts", []); // Requisição de permissões
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Exibe o endereço da conta conectada
        const address = await signer.getAddress();
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('walletAddress').style.display = 'block';
        document.getElementById('walletAddress').textContent = `${address.substring(0, 6)}...${address.substring(38)}`;

        // Carrega as enquetes
        await loadPolls();
    } catch (error) {
        console.error('Erro ao conectar carteira:', error);
        alert('Erro ao conectar carteira');
    }
}

async function addBnbTestnet() {
    // Verifica se o MetaMask está instalado
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask não encontrado. Instale a MetaMask para adicionar a rede!');
        return;
    }

    const chainId = "0x61"; // Chain ID para BNB Smart Chain Testnet (Binance Smart Chain Testnet)
    const chainName = "Binance Smart Chain Testnet";
    const rpcUrls = ["https://data-seed-prebsc-1-s1.binance.org:8545/"];
    const blockExplorerUrls = ["https://testnet.bscscan.com"];
    const nativeCurrency = {
        name: "BNB",
        symbol: "BNB",
        decimals: 18,
    };

    try {
        // Solicita ao MetaMask adicionar a rede, se ela ainda não estiver configurada
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: chainId,
                chainName: chainName,
                rpcUrls: rpcUrls,
                blockExplorerUrls: blockExplorerUrls,
                nativeCurrency: nativeCurrency,
            }]
        });

        alert(`Rede ${chainName} adicionada ao MetaMask!`);
    } catch (error) {
        console.error('Erro ao adicionar a rede:', error);
        alert('Não foi possível adicionar a rede. Tente novamente.');
    }
}


function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-button').forEach(button => button.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

function addOption() {
    const container = document.getElementById('optionsContainer');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'poll-option';
    input.placeholder = `Opção ${container.children.length + 1}`;
    container.appendChild(input);
}

async function createPoll() {
    try {
        if (!contract) {
            alert('Por favor, conecte sua carteira primeiro!');
            return;
        }

        const title = document.getElementById('pollTitle').value;
        const options = Array.from(document.getElementsByClassName('poll-option'))
            .map(input => input.value)
            .filter(value => value.trim() !== '');

        if (!title || options.length < 2) {
            alert('Por favor, preencha o título e pelo menos duas opções!');
            return;
        }

        const tx = await contract.criarEnquete(title, options);
        await tx.wait();
        
        alert('Enquete criada com sucesso!');
        showTab('home');
        await loadPolls();
    } catch (error) {
        console.error('Erro ao criar enquete:', error);
        alert('Erro ao criar enquete');
    }
}

function createPollCard(id, title, active, options, votes) {
    const card = document.createElement('div');
    card.className = 'poll-card';

    const header = document.createElement('h3');
    header.textContent = title;
    card.appendChild(header);

    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'poll-option-button';
        button.textContent = `${option} (${votes[index]} votos)`;

        // Verifica se vote está definido e chama corretamente
        button.onclick = async () => {
            try {
                console.log(`Votando na opção ${index} da enquete ${id}`);
                await vote(id, index);
            } catch (error) {
                console.error('Erro ao votar:', error);
                alert('Erro ao registrar seu voto.');
            }
        };

        card.appendChild(button);
    });

    if (active) {
        const closeButton = document.createElement('button');
        closeButton.className = 'secondary-button';
        closeButton.onclick = () => closePoll(id);
        closeButton.textContent = 'Encerrar Enquete';
        card.appendChild(closeButton);
    }

    return card;
}

async function vote(pollId, optionIndex) {
    try {
        if (!contract || !signer) return;

        const tx = await contract.connect(signer).votar(pollId, optionIndex);
        await tx.wait();

        alert("Voto registrado com sucesso!");
        loadPolls();
    } catch (error) {
        console.error("Erro ao votar:", error);

        if (error?.reason?.includes("Você ja votou")) {
            alert("⚠️ Você já votou nesta enquete.");
        } else {
            alert("❌ Erro ao registrar o voto. Verifique o console.");
        }
    }
}

async function closePoll(pollId) {
    try {
        if (!contract || !signer) return;

        const tx = await contract.connect(signer).encerrarEnquete(pollId);
        await tx.wait();

        alert("Enquete encerrada com sucesso!");
        loadPolls();
    } catch (error) {
        console.error("Erro ao encerrar enquete:", error);

        if (error?.reason?.includes("Somente o criador pode encerrar a enquete")) {
            alert("⚠️ Apenas o criador da enquete pode encerrá-la.");
        } else {
            alert("❌ Erro ao encerrar a enquete. Verifique o console.");
        }
    }
}

async function loadPolls() {
    try {
        if (!contract) return;

        const activePolls = document.getElementById('activePolls');
        const managedPolls = document.getElementById('managedPolls');
        activePolls.innerHTML = '';
        managedPolls.innerHTML = '';

        const total = await contract.totalEnquetes();
        console.log("Total de enquetes:", total);

        for (let pollId = 1; pollId <= total; pollId++) {
            try {
                const [title, active, options, votes] = await contract.obterEnquete(pollId);
                const pollCard = createPollCard(pollId, title, active, options, votes);

                if (active) {
                    // Em vez de clonar, criamos outro card
                    const activePollCard = createPollCard(pollId, title, active, options, votes);
                    activePolls.appendChild(activePollCard);
                }

                managedPolls.appendChild(pollCard);
            } catch (error) {
                console.error(`Erro ao carregar enquete ${pollId}:`, error);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar enquetes:', error);
    }
}



async function createPoll() {
    try {
        if (!contract) {
            alert('Por favor, conecte sua carteira primeiro!');
            return;
        }

        const title = document.getElementById('pollTitle').value;
        const options = Array.from(document.getElementsByClassName('poll-option'))
            .map(input => input.value)
            .filter(value => value.trim() !== '');

        if (!title || options.length < 2) {
            alert('Por favor, preencha o título e pelo menos duas opções!');
            return;
        }

        const tx = await contract.criarEnquete(title, options);
        await tx.wait();
        
        alert('Enquete criada com sucesso!');
        showTab('home');

        setTimeout(async () => {
            await loadPolls();
        }, 3000); // Espera 3s antes de carregar enquetes
    } catch (error) {
        console.error('Erro ao criar enquete:', error);
        alert('Erro ao criar enquete');
    }
}

async function requestTestBNB() {
    try {
        if (!window.ethereum) {
            alert('Por favor, instale a MetaMask!');
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        // Faucet público da BNB Testnet
        const faucetURL = `https://testnet.bnbchain.org/faucet-smart?address=${userAddress}`;

        alert('Redirecionando para o faucet da Testnet...');
        window.open(faucetURL, '_blank');
    } catch (error) {
        console.error('Erro ao solicitar BNB de teste:', error);
        alert('Erro ao solicitar BNB de teste. Tente novamente.');
    }
}

// Escuta mudanças de conta na MetaMask
if (window.ethereum) {
    window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
            const address = accounts[0]; // Novo endereço
            document.getElementById('walletAddress').textContent = 
                `${address.substring(0, 6)}...${address.substring(38)}`;
        } else {
            // Se o usuário desconectar a carteira
            document.getElementById('walletAddress').style.display = 'none';
            document.getElementById('connectWallet').style.display = 'block';
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    showTab('home');
});