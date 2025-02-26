document.addEventListener('DOMContentLoaded', () => {
    const actionBtn = document.getElementById('actionBtn');
    const selectedOption = document.getElementById('selectedOption');
    const optionsContainer = document.getElementById('options');

    let selectedFile = '';

    window.electronAPI.getBatFiles().then(files => {
        const lastSelected = localStorage.getItem('lastSelected');

        files.forEach(file => {
            const option = document.createElement('div');
            const fileName = file.replace('.bat', '');
            const [name, tagText] = fileName.split(/\(([^)]+)\)/);
            const textContainer = document.createElement('span');
            textContainer.textContent = name;

            if (tagText) {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = tagText.trim();
                textContainer.appendChild(tag);
            }

            option.appendChild(textContainer);

            if (fileName === lastSelected) {
                selectedOption.innerHTML = '';
                selectedOption.appendChild(textContainer.cloneNode(true));
                selectedFile = file;
            }

            option.addEventListener('click', () => {
                selectedOption.innerHTML = '';
                selectedOption.appendChild(textContainer.cloneNode(true));
                optionsContainer.style.display = 'none';
                localStorage.setItem('lastSelected', fileName);
                selectedFile = file;
            });

            optionsContainer.appendChild(option);
        });

        if (!lastSelected && files.length > 0) {
            const firstFile = files[0].replace('.bat', '');
            const [name, tagText] = firstFile.split(/\(([^)]+)\)/);
            selectedOption.innerHTML = '';
            const textContainer = document.createElement('span');
            textContainer.textContent = name;

            if (tagText) {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = tagText.trim();
                textContainer.appendChild(tag);
            }

            selectedOption.appendChild(textContainer);
            localStorage.setItem('lastSelected', firstFile);
            selectedFile = files[0];
        }
    });

    actionBtn.addEventListener('click', () => {
        if (selectedFile) {
            if (actionBtn.textContent === 'Остановить') {
                window.electronAPI.stopBatFile();
                selectedOption.disabled = false;
            } else {
                window.electronAPI.startBatFile(selectedFile);
                selectedOption.disabled = true;
            }
        } else {
            console.error('Файл не выбран');
        }
    });

    window.electronAPI.onBatFileStarted(() => {
        actionBtn.textContent = 'Остановить';
        actionBtn.classList.add('stop');
        selectedOption.disabled = true;
    });

    window.electronAPI.onBatFileStopped(() => {
        actionBtn.textContent = 'Запустить';
        actionBtn.classList.remove('stop');
        selectedOption.disabled = false;
    });

    selectedOption.addEventListener('click', () => {
        if (!selectedOption.disabled) {
            optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.custom-combobox')) {
            optionsContainer.style.display = 'none';
        }
    });

    checkWinwsProcess();
    setInterval(checkWinwsProcess, 5000);
});

function checkWinwsProcess() {
    exec('tasklist /FI "IMAGENAME eq winws.exe"', (err, stdout) => {
        const actionBtn = document.getElementById('actionBtn');
        if (stdout.toLowerCase().includes('winws.exe')) {
            actionBtn.textContent = 'Остановить';
            actionBtn.classList.add('stop');
            selectedOption.disabled = true;
        } else {
            actionBtn.textContent = 'Запустить';
            actionBtn.classList.remove('stop');
            selectedOption.disabled = false;
        }
    });
}

document.getElementById('logo').addEventListener('click', function() {
    this.classList.remove('rotate');
    void this.offsetWidth;
    this.classList.add('rotate');
});

document.getElementById('logo').addEventListener('animationend', function() {
    this.classList.remove('rotate');
});
