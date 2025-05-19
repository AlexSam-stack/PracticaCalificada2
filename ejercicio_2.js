document.addEventListener('DOMContentLoaded', () => {
  
    const participantsInput = document.getElementById('participants-input');
    const participantCounter = document.querySelector('.participant-counter');
    const byTeamsRadio = document.getElementById('by-teams');
    const byMembersRadio = document.getElementById('by-members');
    const divisionValueSelect = document.getElementById('division-value');
    const divisionLabel = document.getElementById('division-label');
    const titleInput = document.getElementById('title-input');
    const clearBtn = document.getElementById('clear-btn');
    const generateBtn = document.getElementById('generate-btn');
    const setupScreen = document.getElementById('setup-screen');
    const resultsScreen = document.getElementById('results-screen');
    const resultsTitle = document.getElementById('results-title');
    const teamsContainer = document.getElementById('teams-container');
    const downloadBtn = document.getElementById('download-btn');
    const copyClipboardBtn = document.getElementById('copy-clipboard-btn');
    const copyColumnsBtn = document.getElementById('copy-columns-btn');
    const backBtn = document.getElementById('back-btn');


    updateDivisionOptions();


    participantsInput.addEventListener('input', updateParticipantCount);
    byTeamsRadio.addEventListener('change', updateDivisionOptions);
    byMembersRadio.addEventListener('change', updateDivisionOptions);
    clearBtn.addEventListener('click', clearForm);
    generateBtn.addEventListener('click', generateTeams);
    backBtn.addEventListener('click', showSetupScreen);
    downloadBtn.addEventListener('click', downloadAsJpg);
    copyClipboardBtn.addEventListener('click', copyToClipboard);
    copyColumnsBtn.addEventListener('click', copyInColumns);


    function updateParticipantCount() {
        const lines = participantsInput.value.trim() ? participantsInput.value.trim().split('\n') : [];
        const count = lines.length;
        participantCounter.textContent = count;
        

        if (count > 100) {
            alert('El número máximo de participantes es 100.');
            participantsInput.value = lines.slice(0, 100).join('\n');
            participantCounter.textContent = '100';
        }
        

        const tooLongLines = lines.filter(line => line.length > 50);
        if (tooLongLines.length > 0) {
            alert('El nombre de cada participante debe tener máximo 50 caracteres.');
            participantsInput.value = lines.map(line => 
                line.length > 50 ? line.substring(0, 50) : line
            ).join('\n');
        }
    }

    function updateDivisionOptions() {
        divisionValueSelect.innerHTML = '';
        
        if (byTeamsRadio.checked) {
            divisionLabel.textContent = 'equipos /';
            for (let i = 2; i <= 20; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + ' equipos';
                divisionValueSelect.appendChild(option);
            }
        } else {
            divisionLabel.textContent = 'por equipo';
            // Populate options 2-20 for members per team
            for (let i = 2; i <= 20; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + ' participantes';
                divisionValueSelect.appendChild(option);
            }
        }
    }

    function clearForm() {
        participantsInput.value = '';
        updateParticipantCount();
        titleInput.value = '';
        byTeamsRadio.checked = true;
        updateDivisionOptions();
    }

    function showSetupScreen() {
        resultsScreen.style.display = 'none';
        setupScreen.style.display = 'block';
    }


    function generateTeams() {

        const participantsText = participantsInput.value.trim();
        if (!participantsText) {
            alert('Debe ingresar al menos un participante');
            return;
        }

        const participants = participantsText.split('\n').map(p => p.trim()).filter(p => p !== '');
        
        if (participants.length < 2) {
            alert('Debe ingresar al menos 2 participantes');
            return;
        }

        const byTeams = byTeamsRadio.checked;
        const divisionValue = parseInt(divisionValueSelect.value);
        

        let teams = [];
        let shuffledParticipants = shuffle([...participants]);
        
        if (byTeams) {

            const numTeams = divisionValue;
            teams = Array.from({ length: numTeams }, () => []);
            
            shuffledParticipants.forEach((participant, index) => {
                teams[index % numTeams].push(participant);
            });
        } else {

            const membersPerTeam = divisionValue;
            const numTeams = Math.ceil(shuffledParticipants.length / membersPerTeam);
            
            for (let i = 0; i < numTeams; i++) {
                teams.push(shuffledParticipants.slice(i * membersPerTeam, (i + 1) * membersPerTeam));
            }
        }
        

        displayResults(teams);
    }


    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }


    function displayResults(teams) {

        const title = titleInput.value.trim() || 'Equipos Generados';
        resultsTitle.textContent = title;
        

        teamsContainer.innerHTML = '';
        
        
        teams.forEach((team, index) => {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'team';
            
            const teamTitle = document.createElement('div');
            teamTitle.className = 'team-title';
            teamTitle.textContent = `Equipo ${index + 1}`;
            teamDiv.appendChild(teamTitle);
            
            
            const membersContainer = document.createElement('div');
            teamDiv.appendChild(membersContainer);
            
            teamsContainer.appendChild(teamDiv);
            
            
            team.forEach((member, memberIndex) => {
                setTimeout(() => {
                    const memberDiv = document.createElement('div');
                    memberDiv.className = 'team-member';
                    
    
                    if (member.startsWith('*')) {
                        const nameWithoutStar = member.substring(1).trim();
                        memberDiv.innerHTML = `<strong>${nameWithoutStar}</strong> (Líder)`;
                    } else {
                        memberDiv.textContent = member;
                    }
                    
                    membersContainer.appendChild(memberDiv);
                }, 100 * memberIndex);
            });
        });
        

        setupScreen.style.display = 'none';
        resultsScreen.style.display = 'block';
    }

    function downloadAsJpg() {
        const element = document.getElementById('results-screen');
        

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        

        const teamElements = teamsContainer.querySelectorAll('.team');
        

        const teamPadding = 20;
        const memberHeight = 30;
        const teamTitleHeight = 40;
        const titleHeight = 60;
        const bottomPadding = 40;
        
        let totalHeight = titleHeight;
        

        teamElements.forEach(teamElement => {
            const members = teamElement.querySelectorAll('.team-member');
            const teamHeight = teamTitleHeight + (members.length * memberHeight) + (teamPadding * 2);
            totalHeight += teamHeight + 20;
        });
        
        totalHeight += bottomPadding;
        

        const elementRect = element.getBoundingClientRect();
        canvas.width = elementRect.width;
        canvas.height = totalHeight;
        

        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        

        context.font = 'bold 24px Arial';
        context.fillStyle = '#000000';
        context.fillText(resultsTitle.textContent, 20, 40);
        
        let yOffset = titleHeight;
        
        teamElements.forEach((teamElement, index) => {
            const teamTitle = teamElement.querySelector('.team-title').textContent;
            const members = teamElement.querySelectorAll('.team-member');
            

            const teamHeight = teamTitleHeight + (members.length * memberHeight) + (teamPadding * 2);
            

            context.fillStyle = '#F8F9FA';
            context.strokeStyle = '#DDDDDD';
            context.lineWidth = 1;
            context.fillRect(20, yOffset, canvas.width - 40, teamHeight);
            context.strokeRect(20, yOffset, canvas.width - 40, teamHeight);
            

            context.fillStyle = '#F5F5F5';
            context.fillRect(20, yOffset, canvas.width - 40, teamTitleHeight);
            context.strokeRect(20, yOffset, canvas.width - 40, teamTitleHeight);
            

            context.font = 'bold 16px Arial';
            context.fillStyle = '#000000';
            context.textAlign = 'center';
            context.fillText(teamTitle, canvas.width / 2, yOffset + 25);
            context.textAlign = 'left';
            

            context.font = '14px Arial';
            members.forEach((member, memberIndex) => {
                const memberY = yOffset + teamTitleHeight + (memberIndex * memberHeight) + 20;
                context.fillStyle = '#F8F9FA';
                context.fillRect(30, memberY - 15, canvas.width - 60, memberHeight - 5);
                
                context.fillStyle = '#000000';
                if (member.textContent.includes('(Líder)')) {
                    context.font = 'bold 14px Arial';
                } else {
                    context.font = '14px Arial';
                }
                context.fillText(member.textContent, 40, memberY);
            });
            

            yOffset += teamHeight + 20;
        });
        

        try {
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            

            const title = titleInput.value.trim() || 'equipos';
            const link = document.createElement('a');
            link.download = title.replace(/\s+/g, '-').toLowerCase() + '.jpg';
            link.href = imgData;
            
    
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error al generar la imagen:', error);
            alert('No se pudo generar la imagen. Intente con menos equipos o en otro navegador.');
        }
    }


    function copyToClipboard() {
        let text = resultsTitle.textContent + '\n\n';
        

        const teamElements = teamsContainer.querySelectorAll('.team');
        teamElements.forEach(teamElement => {
            const teamTitle = teamElement.querySelector('.team-title').textContent;
            text += teamTitle + ':\n';
            
            const members = teamElement.querySelectorAll('.team-member');
            members.forEach(member => {
                text += '- ' + member.textContent + '\n';
            });
            
            text += '\n';
        });
        
        navigator.clipboard.writeText(text).then(() => {
            alert('Equipos copiados al portapapeles');
        }).catch(err => {
            console.error('Error al copiar: ', err);
            alert('No se pudo copiar al portapapeles');
        });
    }

    function copyInColumns() {
        const teamElements = teamsContainer.querySelectorAll('.team');
        let maxMembers = 0;

        teamElements.forEach(teamElement => {
            const members = teamElement.querySelectorAll('.team-member');
            maxMembers = Math.max(maxMembers, members.length);
        });

        const columns = [];
        teamElements.forEach(teamElement => {
            const column = [];
            const teamTitle = teamElement.querySelector('.team-title').textContent;
            column.push(teamTitle);
            
            const members = teamElement.querySelectorAll('.team-member');
            members.forEach(member => {
                column.push(member.textContent);
            });

            while (column.length < maxMembers + 1) {
                column.push('');
            }
            
            columns.push(column);
        });

        let text = '';
        for (let row = 0; row < maxMembers + 1; row++) {
            for (let col = 0; col < columns.length; col++) {
                text += columns[col][row] + (col < columns.length - 1 ? '\t' : '');
            }
            text += '\n';
        }

        navigator.clipboard.writeText(text).then(() => {
            alert('Equipos copiados en formato de columnas');
        }).catch(err => {
            console.error('Error al copiar: ', err);
            alert('No se pudo copiar al portapapeles');
        });
    }
});