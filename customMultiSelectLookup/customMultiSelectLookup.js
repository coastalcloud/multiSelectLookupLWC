import { LightningElement, wire, api } from 'lwc';
import getLookupData from '@salesforce/apex/CustomMultiSelectLookupController.getLookupData';
const DELAY = 200; // milliseconds

export default class CustomMultiSelectLookup extends LightningElement {
    @api maxQueryResult; 
    @api maxSelection; 
    @api selectCriteria;
    @api iconName;
    @api objectApiName;
    @api fieldApiName;
    @api lookupLabel;
    @api 
    get selectionCriteria() { return this.selectCriteria !== null && this.selectCriteria !== undefined ? this.selectCriteria : ' '; }
    set selectionCriteria(value) { this.selectCriteria = value; }
    @api   
    get maxQueryLimit() { return this.maxQueryResult !== null && this.maxQueryResult !== undefined ? this.maxQueryResult : 20; }
    set maxQueryLimit(value) { this.maxQueryResult = value; }
    @api 
    get maxRecordSelect() { return this.maxSelection !== null && this.maxSelection !== undefined ? this.maxSelection : 10; }
    set maxRecordSelect(value) { this.maxSelection = value; }
    @api 
    get placeHolder() { return 'Search ' + this.lookupLabel; }
    @api recordTypes = [];
    @api selectedRecIds = [];
    @api userSelection = [];
    delayTimeout;
    hasRecords = false;
    searchKey = '';                
    searchOutput = [];       // Result of Apex selection
    selectedRecords = [];    
    showDropdown = false;    // State variable to control dropdown visibility
    searchResultCount = 0;

    @wire(getLookupData, {    
        searchKey: "$searchKey",
        objectApiName: "$objectApiName",
        fieldApiName: "$fieldApiName",
        maxQueryResult: "$maxQueryLimit",
        selectCriteria: "$selectionCriteria",
        recordTypes: "$recordTypes"
    })

    searchResult({ data, error }) {
        if (data) {
            this.searchResultCount = this.searchResultCount + 1;
            this.hasRecords = data.length > 0 ? true : false;
            // Add a property to each record with the key field value
            this.searchOutput = data.map(record => ({
                Id: record.Id,
                fieldValue: record[this.fieldApiName]
            }));
        } else if (error) {
            console.log(error);
        }
    }
    
    connectedCallback() {
        // Deserialize userSelection to objects
        if (this.userSelection.length > 0) {
            this.selectedRecords = JSON.parse(this.userSelection);         
        }
        this.clearSearchInput();
    }


    handleChange(event){
        clearTimeout(this.delayTimeout);
        let value = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.searchKey = value;
        }, DELAY);
    }

    handleInput(event) {
        if (!event.target.value) {
            this.showDropdown = this.hasRecords;                                    // Show all records if search bar is empty
        }
    }

    handleClick(event) {
        let recId;

        if (event.target.hasAttribute("data-recid")) {
            recId = event.target.getAttribute("data-recid");
        } else {
            const closestRecElement = event.target.closest("div[data-recid]");
            if (closestRecElement) {
                recId = closestRecElement.getAttribute("data-recid");
            }
        }

        if(recId){
            if (this.selectedRecords.length < this.maxRecordSelect) {
                if (this.validateDuplicate(recId)) {
                    let selectedRecord = this.searchOutput.find(currItem => currItem.Id === recId);
                    let pill = {
                        type: 'icon',
                        label: selectedRecord.fieldValue,
                        Name: recId,
                        iconName: this.iconName,
                        alternativeText: selectedRecord.fieldValue
                    };
                    this.selectedRecords = [...this.selectedRecords, pill];
                    this.selectedRecIds =  [...this.selectedRecIds, recId];  
                    this.userSelection = JSON.stringify(this.selectedRecords);      // Serialize the selectedRecods to JSON strings          
                    this.clearSearchInput();                                        // Clear the search input field without focusing it
                }
            } 
        }
    }

    handleItemRemove(event) {
        const selectedIndex = event.detail.index;
        const recIdToRemove = this.selectedRecords[selectedIndex].Name;
        this.selectedRecords.splice(selectedIndex, 1);
        this.selectedRecIds = this.selectedRecIds.filter(recId => recId !== recIdToRemove);
        this.userSelection = JSON.stringify(this.selectedRecords);                  // Serialize the selectedRecords to JSON strings
        this.clearSearchInput();
    }

    get showPillContainer() {
        return this.selectedRecords.length > 0 ? true : false;
    }

    validateDuplicate(selectedRecord) {
        return !this.selectedRecords.some(currItem => currItem.Name === selectedRecord);
    }

    clearSearchInput() {
        const searchInput = this.template.querySelector('lightning-input');
        if (searchInput) {
            searchInput.value = '';
        }
        this.showDropdown = false;  
        this.searchKey = '';
    }

    handleFocus(event) {
        if (this.searchResultCount > 0) {
            this.showDropdown = true;         
        }
   }

    handleBlur(event) {
        // Delay to allow other events to process
        const searchBox = this.template.querySelector('.slds-combobox');
        setTimeout(() => {
            if (!searchBox.contains(document.activeElement)) {
                this.showDropdown = false;
            }
        }, 200);  // Adjust the delay as necessary


    }
}
