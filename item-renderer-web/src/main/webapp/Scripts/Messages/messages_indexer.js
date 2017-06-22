//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿/* MessageIndex.cs */
TDS.Messages.MessageIndex = function(langIdx /*int*/, subjectIdx /*int*/, gradeIdx /*int*/)
{
    this._langIdx = langIdx;
    this._subjectIdx = subjectIdx;
    this._gradeIdx = gradeIdx;
};

TDS.Messages.MessageIndex.prototype.getLanguageIndex = function() { return this._langIdx; };
TDS.Messages.MessageIndex.prototype.getSubjectIndex = function() { return this._subjectIdx; };
TDS.Messages.MessageIndex.prototype.getGradeIndex = function() { return this._gradeIdx; };

/* MessageIndexer.cs */

TDS.Messages.MessageIndexer = function()
{
    this._languageDictionary = new Util.Structs.Map(); // <string, int>
    this._subjectDictionary = new Util.Structs.Map(); // <string, int>
    this._gradeDictionary = new Util.Structs.Map(); // <string, int>

    this.init();
};

TDS.Messages.MessageIndexer.prototype.init = function()
{
    this._languageDictionary.clear();
    this._subjectDictionary.clear();
    this._gradeDictionary.clear();
    
    this._languageDictionary.set('ENU', 0);
    this._subjectDictionary.set('DefaultSubject', 0);
    this._gradeDictionary.set('DefaultGrade', 0);
};

TDS.Messages.MessageIndexer.prototype.addLanguage = function(language)
{
    if (!YAHOO.lang.isString(language)) return 0;
    
    // check if language
    if (this._languageDictionary.containsKey(language))
    {
        return this._languageDictionary.get(language);
    }

    this._languageDictionary.set(language, this._languageDictionary.getCount());
    return this._languageDictionary.getCount() - 1;
};

TDS.Messages.MessageIndexer.prototype.addSubject = function(subject)
{
    if (!YAHOO.lang.isString(subject)) return 0;
    
    // check if subject
    if (this._subjectDictionary.containsKey(subject))
    {
        return this._subjectDictionary.get(subject);
    }

    this._subjectDictionary.set(subject, this._subjectDictionary.getCount());
    return this._subjectDictionary.getCount() - 1;
};

TDS.Messages.MessageIndexer.prototype.addGrade = function(grade)
{
    if (!YAHOO.lang.isString(grade)) return 0;
    
    // check if grade
    if (this._gradeDictionary.containsKey(grade))
    {
        return this._gradeDictionary.get(grade);
    }

    this._gradeDictionary.set(grade, this._gradeDictionary.getCount());
    return this._gradeDictionary.getCount() - 1;
};

TDS.Messages.MessageIndexer.prototype.createIndexer3D = function()
{
    var i1 = (this._languageDictionary.getCount() > 0) ? this._languageDictionary.getCount() : 1;
    var i2 = (this._subjectDictionary.getCount() > 0) ? this._subjectDictionary.getCount() : 1;
    var i3 = (this._gradeDictionary.getCount() > 0) ? this._gradeDictionary.getCount() : 1;
    return Util.Array.createMultiDimArray(i1, i2, i3);
};

TDS.Messages.MessageIndexer.prototype.getLanguageIndex = function(language)
{
    if (!YAHOO.lang.isString(language) || this._languageDictionary.getCount() == 0) return 0;
    
    if (this._languageDictionary.containsKey(language))
    {
        return this._languageDictionary.get(language);
    }

    return 0;
};

TDS.Messages.MessageIndexer.prototype.getSubjectIndex = function(subject)
{
    if (!YAHOO.lang.isString(subject) || this._subjectDictionary.getCount() == 0) return 0;
    
    if (this._subjectDictionary.containsKey(subject))
    {
        return this._subjectDictionary.get(subject);
    }

    return 0;
};

TDS.Messages.MessageIndexer.prototype.getGradeIndex = function(grade)
{
    if (!YAHOO.lang.isString(grade) || this._gradeDictionary.getCount() == 0) return 0;
    
    if (this._gradeDictionary.containsKey(grade))
    {
        return this._gradeDictionary.get(grade);
    }

    return 0;
};

TDS.Messages.MessageIndexer.prototype.get = function(language, subject, grade)
{
    var langIdx = this.getLanguageIndex(language);
    var subjectIdx = this.getSubjectIndex(subject);
    var gradeIdx = this.getGradeIndex(grade);
    return new TDS.Messages.MessageIndex(langIdx, subjectIdx, gradeIdx);
};