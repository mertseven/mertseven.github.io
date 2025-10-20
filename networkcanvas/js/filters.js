// js/filters.js
import { get as getState } from './state.js';

const filterControlsContainer = document.getElementById('filter-controls-container');
const pillsContainer = document.getElementById('active-filters-pills-container');

export function renderFilterPanel() {
    const { demographicKeys, masterSociogramData, activeFilters } = getState();
    filterControlsContainer.innerHTML = '';

    if (!demographicKeys || demographicKeys.length === 0) {
        filterControlsContainer.innerHTML = '<p class="hint">No demographics available. Import data to create filters.</p>';
        return;
    }

    demographicKeys.forEach(key => {
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item');

        const button = document.createElement('button');
        button.classList.add('accordion-button');
        button.textContent = key;
        button.addEventListener('click', () => {
            accordionItem.classList.toggle('active');
        });

        const panel = document.createElement('div');
        panel.classList.add('accordion-panel');

        const values = [...new Set(masterSociogramData.nodes.map(n => n.demographics[key]).filter(v => v))];
        
        values.forEach(value => {
            const count = masterSociogramData.nodes.filter(n => n.demographics[key] === value).length;
            const checkboxContainer = document.createElement('div');
            checkboxContainer.classList.add('checkbox-item');
            
            const isChecked = activeFilters[key] ? activeFilters[key].has(value) : true;

            checkboxContainer.innerHTML = `
                <input type="checkbox" id="filter-check-${key}-${value}" data-key="${key}" data-value="${value}" ${isChecked ? 'checked' : ''}>
                <label for="filter-check-${key}-${value}">${value} (${count})</label>
            `;
            panel.appendChild(checkboxContainer);
        });

        accordionItem.appendChild(button);
        accordionItem.appendChild(panel);
        filterControlsContainer.appendChild(accordionItem);
    });
}

export function getActiveFilters() {
    const { activeFilters } = getState();
    return activeFilters;
}
