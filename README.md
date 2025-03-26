March-2025 Multi-Select Lookup LWC for Lightning Screen Flow
Currently the standard Salesforce Lookup component, used in Lightning Screen Flows, does not provide the capability to select more than one item on the mobile form factor.  Salesforce's current solution is to use a Choice Selection within the LWC Lookup component.  However, this solution requires the preselection of all records to present for the user's selection.  For the application that needed the lookup, this choice resource would have required an inefficient amount of records to be retained in memory.  This custom component provides the capability to provide an efficient and scalable lookup selection to the user on the desktop and mobile platforms.  This custom component is a highly configurable component.  It can be used for any SObject.  Also, Record Types can be used as a query filter.  
Please view the list of parameters for more information on the ability to configure the record selections.
The parameters for this component:
(1) objectApiName: 		 input the Api name of the Object to be used for the lookup.
(2) keyFieldApiName: 	 input the field name to use in selection (i.e.Name or CaseNumber). This is used in the WHERE clause of the query.
(3) lookupLabel: 			 input the text to be used as a label for the lookup.
(4) iconName: 				 input the technical name for the Icon (e.g. standard:account).
(5) recordTypes: 			 input a record collection of the record types to be used to filter the selection result.
(6) selectionCriteria: input a string to be used as additional selection criteria in the SQL query. Create a string in the format: 'AND fieldApiName operator condition'. Example: 'AND CreatedDate = TODAY() AND IsActive = true
(7) maxQueryResult: 	 input the maximum number of records to select on each search. Used in the LIMIT clause of the query. Default value is 10. 
(8) maxSelection: 		 input the maximum number of records that the user can select from the lookup. Default value is 5.
(9) useLocalStorage:   set to true to keep track of the last selection used
(10) userSelection: 	 output to save the User Selection to a text Collection. This is used to re-display the user's selection as needed.  For example, when the screen is refreshed due to a data validation error.
(11) selectedRecIds		 output collection of record Ids of the selection result. Use this to retrieve the records.
