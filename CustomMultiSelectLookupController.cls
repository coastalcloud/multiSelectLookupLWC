public with sharing class CustomMultiSelectLookupController {


    @AuraEnabled(cacheable=true)
    public static List<sObject> getLookupData(  String searchKey, 
                                                String objectApiName, 
                                                String keyFieldApiName,
                                                Integer maxQueryResult, 
                                                List<RecordType> recordTypes){
        // Variables
        List<sObject> sObjectList = new List<sObject>();
        List<String> recordTypeIds = new List<String>();
        String searchQuery;

        try {
            // Set default if maxQueryResult was not sent or set to 0
            Integer maxLimit = (maxQueryResult < 1) ? 10 : maxQueryResult;

            // When there is no search key or record types, return an empty list
            if(String.isBlank(searchKey) && recordTypes.isEmpty()) {
                return sObjectList;
            } else {
                // Verify Object & Search Field Names
                Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectApiName);
                if (sObjectType == null) {
                    throw new AuraHandledException('objectApiName ' + objectApiName + ' is not valid');
                } else {
                    System.debug('objectApiName: ' + objectApiName  + '  keyFieldApiName: ' + keyFieldApiName);

                    // Get the SObject description and field map
                    Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();
                    Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();
                
                    if(fieldMap.containsKey(keyFieldApiName)) {
                        // Build search variable
                        String key = '%' + String.escapeSingleQuotes(searchKey) + '%';

                        // Build queries based on other inputs: Record Types and Search Field value
                        if(recordTypes.isEmpty()){
                            searchQuery = 'SELECT Id, ' + keyFieldApiName + ' FROM ' + objectApiName + ' WHERE ' + keyFieldApiName + ' LIKE :key ORDER BY ' + keyFieldApiName + ' LIMIT ' + maxLimit;
                         } else {
                            // Parametize Record Type Ids for query
                            for (RecordType recordType : recordTypes) {
                                recordTypeIds.add(recordType.Id);
                            }

                            // Include Record Type selection with or without Search Field value
                            if(String.isBlank(searchKey)) {
                                searchQuery = 'SELECT Id, ' + keyFieldApiName + ' FROM ' + objectApiName + ' WHERE RecordTypeId IN :recordTypeIds ORDER BY ' + keyFieldApiName + ' LIMIT ' + maxLimit;
                            } else {
                                searchQuery = 'SELECT Id, ' + keyFieldApiName + ' FROM ' + objectApiName + ' WHERE RecordTypeId IN :recordTypeIds AND '  + keyFieldApiName + ' LIKE :key ORDER BY ' + keyFieldApiName + ' LIMIT ' + maxLimit;
                            }
                        }
                        System.debug('searchQuery: ' + searchQuery);

                        // Execute query
                        sObjectList = Database.query(searchQuery, AccessLevel.USER_MODE);
                        
                        return SObjectList;
                    } else {
                        throw new AuraHandledException('Values for objectApiName and keyFieldApiName must be valid.');
                    }
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}