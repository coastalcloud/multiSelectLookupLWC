public with sharing class CustomMultiSelectLookupController {


    @AuraEnabled(cacheable=true)
    public static List<sObject> getLookupData(  String searchKey, 
                                                String objectApiName, 
                                                String fieldApiName,
                                                Integer maxQueryResult, 
                                                String selectCriteria,
                                                List<RecordType> recordTypes){

        System.debug('searchKey: ' + searchKey);
        System.debug('objectApiName: ' + objectApiName);
        System.debug('fieldApiName: ' + fieldApiName); 
        System.debug('maxQueryResult: ' + maxQueryResult); 
        System.debug('selectCriteria: ' + selectCriteria);
        for(RecordType rt : recordTypes) {
            System.debug('RecordTypeId: ' + rt.Id + '  DeveloperName: ' + rt.DeveloperName);
        }
        
        // local variables
        List<sObject> sObjectList = new List<sObject>();
        List<String> recordTypeIds = new List<String>();
        String searchQuery;
        String selectionCriteria;

        try {
            // Set default if maxQueryResult was not sent or set to 0
            Integer maxLimit = (maxQueryResult < 1) ? 20 : maxQueryResult;

            // When there is no search key or record types, return an empty list
            if(String.isBlank(searchKey) && recordTypes.isEmpty() && String.isBlank(selectCriteria)) {
                return sObjectList;
            } else {
                // Verify Object & Search Field Names
                Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectApiName);
                if (sObjectType == null) {
                    throw new AuraHandledException('objectApiName ' + objectApiName + ' is not valid');
                } else {
                    // Get the SObject description and field map
                    Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();
                    Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();
                
                    if (fieldMap.containsKey(fieldApiName)) {
                        // Build search variable
                        String key = '%' + String.escapeSingleQuotes(searchKey) + '%';

                        //Set Selection Criteria 
                        if (String.isBlank(selectCriteria)){
                            selectionCriteria = '';
                        } else {
                            selectionCriteria = selectCriteria;
                        }

                        // Build queries based on other inputs: Record Types and Search Field value
                        if (recordTypes.isEmpty()) {
                            if (String.isBlank(searchKey)){
                                String criteriaSubString = selectionCriteria.removeStartIgnoreCase('AND');
                                searchQuery = 'SELECT Id, ' + fieldApiName + ' FROM ' + objectApiName + ' WHERE '  + criteriaSubString + ' ORDER BY ' + fieldApiName + ' LIMIT ' + maxLimit;
                            } else {
                                searchQuery = 'SELECT Id, ' + fieldApiName + ' FROM ' + objectApiName + ' WHERE ' + fieldApiName + ' LIKE :key ' + selectionCriteria + ' ORDER BY ' + fieldApiName + ' LIMIT ' + maxLimit;
                            }
                         } else {
                            // Parametize Record Type Ids for query
                            for (RecordType recordType : recordTypes) {
                                recordTypeIds.add(recordType.Id);
                            }

                            // Include Record Type selection with or without Search Field value
                            if (String.isBlank(searchKey)) {
                                searchQuery = 'SELECT Id, ' + fieldApiName + ' FROM ' + objectApiName + ' WHERE RecordTypeId IN :recordTypeIds ' + selectionCriteria + ' ORDER BY ' + fieldApiName + ' LIMIT ' + maxLimit;
                            } else {
                                searchQuery = 'SELECT Id, ' + fieldApiName + ' FROM ' + objectApiName + ' WHERE RecordTypeId IN :recordTypeIds AND '  + fieldApiName + ' LIKE :key ' + selectionCriteria + ' ORDER BY ' + fieldApiName + ' LIMIT ' + maxLimit;
                            }
                        }

                        // Execute query
                        System.debug('searchQuery: ' + searchQuery);
                        sObjectList = Database.query(searchQuery, AccessLevel.USER_MODE);
                        return SObjectList;
                    } else {
                        throw new AuraHandledException('Object Api Name and Field Api Name must be valid.');
                    }
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
