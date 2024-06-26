import { LightningElement, wire, api } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import getLookupData from '@salesforce/apex/CustomMultiSelectLookupController.getLookupData';
const DELAY = 200; // milliseconds

export default class CustomMultiSelectLookup extends LightningElement {
    _maxResult; 
    _maxSelect; 
    @api iconName;
    @api keyFieldApiName;
    @api lookupLabel;
    @api   
    get maxQueryResult() { return this._maxResult !== null && this._maxResult !== undefined ? this._maxResult : 10; }
    set maxQueryResult(value) { this._maxQueryResult = value; }
    @api 
    get maxSelection() { return this._maxSelect !== null && this._maxSelect !== undefined ? this._maxSelect : 5; }
    set maxSelection(value) { this._maxSelect = value; }
    @api objectApiName;
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

    @wire(getLookupData, {    
        searchKey: "$searchKey",
        objectApiName: "$objectApiName",
        keyFieldApiName: "$keyFieldApiName",
        maxQueryResult: "$maxQueryResult",
        recordTypes: "$recordTypes"
    }) 

    searchResult({ data, error }) {
        console.log('searchResult');
        if (data) {
            console.log(data);
            this.hasRecords = data.length > 0 ? true : false;
            // Add a property to each record with the key field value
            this.searchOutput = data.map(record => ({
                Id: record.Id,
                keyFieldValue: record[this.keyFieldApiName]
            }));
        } else if (error) {
            console.log(error);
        }
    }

    connectedCallback() {
        console.log('connectedCallback');
        
        // Deserialize userSelection to objects
        if (this.userSelection.length > 0) {
            this.selectedRecords = JSON.parse(this.userSelection);         
        }
        // this.resetSearchState();
    }

    handleChange(event){
        console.log('handleChange');
        clearTimeout(this.delayTimeout);
        let value = event.target.value;
        this.delayTimeout = setTimeout(() => {
            this.searchKey = value;
        }, DELAY);
    }

    handleInput(event) {
        console.log('handleInput');
        if (!event.target.value) {
            this.showDropdown = this.hasRecords;                                    // Show all records if search bar is empty
        }
    }

    handleClick(event) {
        console.log('handleClick');
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
            console.log('recId', recId);
            if (this.selectedRecords.length < this.maxSelection) {
                if (this.validateDuplicate(recId)) {
                    let selectedRecord = this.searchOutput.find(currItem => currItem.Id === recId);
                    let pill = {
                        type: 'icon',
                        label: selectedRecord.keyFieldValue,
                        Name: recId,
                        iconName: this.iconName,
                        alternativeText: selectedRecord.keyFieldValue
                    };
                    this.selectedRecords = [...this.selectedRecords, pill];
                    this.selectedRecIds.push(recId);   
                    this.userSelection = JSON.stringify(this.selectedRecords);      // Serialize the selectedRecods to JSON strings          
                    this.clearSearchInput();                                        // Clear the search input field without focusing it
                }
            } 
        }
    }

    handleItemRemove(event) {
        console.log('handleItemRemove');
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
        console.log('clearSearchInput');
        const searchInput = this.template.querySelector('lightning-input');
        if (searchInput) {
            searchInput.value = '';
        }
        this.showDropdown = false;  
        this.searchKey = '';
    }

    handleFocus() {
        console.log('handleFocus');
        this.showDropdown = true;
    }

    handleBlur(event) {
        console.log('handleBlur');
        const searchBox = this.template.querySelector('.slds-combobox');
        // Delay to allow other events to process
        setTimeout(() => {
            if (!searchBox.contains(document.activeElement)) {
                this.showDropdown = false;
            }
        }, 200);  // Adjust the delay as necessary
    }

    // resetSearchState() {
    //     console.log('resetSearchState');
    //     //this.clearSearchInput();
    //     const searchInput = this.template.querySelector('lightning-input');
    //     if (searchInput) {
    //         searchInput.blur();
    //     }
    // }
}
