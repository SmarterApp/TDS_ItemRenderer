if (typeof TDS == 'undefined') TDS = {};

TDS.Messages = { };

/* MessageTranslation.cs */

TDS.Messages.MessageTranslation = function(message /*TDS.Messages.Message*/, clientMessage, languageCode, subject, gradeCode)
{
    this._message = message;
    this._clientMessage = clientMessage;
    this._languageCode = languageCode || null;
    this._subject = subject || null;
    this._gradeCode = gradeCode || null;
};

TDS.Messages.MessageTranslation.prototype.getParentMessage = function() { return this._message; };
TDS.Messages.MessageTranslation.prototype.getClientMessage = function() { return this._clientMessage; };
TDS.Messages.MessageTranslation.prototype.getLanguage = function() { return this._languageCode; };
TDS.Messages.MessageTranslation.prototype.getSubject = function() { return this._subject; };
TDS.Messages.MessageTranslation.prototype.getGrade = function() { return this._gradeCode; };

/* Message.cs */

TDS.Messages.Message = function(context /*TDS.Messages.MessageContext*/, messageId /*int*/, defaultMessage /*string*/)
{
    this._context = context;
    this._messageId = messageId;
    this._defaultMessage = defaultMessage;
    this._translationList = []; // <TDS.Messages.MessageTranslation>
    this._translation3D = null; // [,,]
};

TDS.Messages.Message.prototype.getParentContext = function() { return this._context; };
TDS.Messages.Message.prototype.getMessageId = function() { return this._messageId; };
TDS.Messages.Message.prototype.getDefaultMessage = function() { return this._defaultMessage; };

TDS.Messages.Message.prototype.getTranslations = function() { return this._translationList; };

TDS.Messages.Message.prototype.addTranslation = function(clientMessage, languageCode, gradeCode, subject)
{
    var translation = new TDS.Messages.MessageTranslation(this, clientMessage, languageCode, gradeCode, subject);
    this._translationList.push(translation);
    return translation;
};

TDS.Messages.Message.prototype.initTranslationIndex = function(translation3D)
{
    this._translation3D = translation3D;
};

TDS.Messages.Message.prototype.setTranslationIndex = function(messageIndex /*MessageIndex*/, translationIndex /*int*/)
{
    var langIdx = messageIndex.getLanguageIndex();
    var subjectIdx = messageIndex.getSubjectIndex();
    var gradeIdx = messageIndex.getGradeIndex();
    this._translation3D[langIdx][subjectIdx][gradeIdx] = translationIndex;
};

//message translation selection
TDS.Messages.Message.prototype.getTranslationByIndex = function(messageIndex /*MessageIndex*/)
{
    var langIdx = messageIndex.getLanguageIndex();
    var subjectIdx = messageIndex.getSubjectIndex();
    var gradeIdx = messageIndex.getGradeIndex();

    var index = this._translation3D[langIdx, subjectIdx, gradeIdx];
    if (!YAHOO.lang.isNumber(index)) index = 0;
    return this._translationList[index];
};

TDS.Messages.Message.prototype.getTranslationByLang = function(languageCode)
{
    var translations = this.getTranslations();

    // look for specific language
    var translation = Util.Array.find(translations, function(translation)
    {
        return (translation.getLanguage() == languageCode);
    });

    // check if language was found
    if (translation != null) return translation;

    // if language was not found return default if available
    if (translation == null && translations.length > 0) return translations[0];
    return null;
};

TDS.Messages.Message.prototype.toString = function() { return this.getDefaultMessage(); };

/* MessageContext.cs */

TDS.Messages.MessageContext = function(contextName)
{
    this._name = contextName;
    this._messagesLookup = new Util.Structs.Map(); // <string, TDS.Messages.Message>
};

TDS.Messages.MessageContext.prototype.getName = function() { return this._name; };

TDS.Messages.MessageContext.prototype.addMessage = function(messageId /*int*/, defaultMessage /*string*/)
{
    var message = new TDS.Messages.Message(this, messageId, defaultMessage);
    this._messagesLookup.set(defaultMessage, message);
    return message;
};

TDS.Messages.MessageContext.prototype.getMessages = function()
{
     return this._messagesLookup.getValues();
};

TDS.Messages.MessageContext.prototype.getMessage = function(defaultMessage /*string*/)
{
    return this._messagesLookup.get(defaultMessage);
};

TDS.Messages.MessageContext.prototype.toString = function() { return this.getName(); };

/* MessageSystem.cs */

TDS.Messages.MessageSystem = function()
{
    this._languages = [];
    this._messageIndexer = new TDS.Messages.MessageIndexer();
    this._messageContexts = new Util.Structs.Map(); // <string, TDS.Messages.MessageContext>
};

// check if a language exists
TDS.Messages.MessageSystem.prototype.hasLanguage = function(language)
{
    return (this._languages.indexOf(language) != -1);
};

// get the current language 
// NOTE: override this function to supply your own way to get current language
TDS.Messages.MessageSystem.prototype._getLanguage = function() { return 'ENU'; };

TDS.Messages.MessageSystem.prototype.getIndexer = function() { return this._messageIndexer; };

TDS.Messages.MessageSystem.prototype.addContext = function(context /*string*/)
{
    var messageContext = new TDS.Messages.MessageContext(context);
    this._messageContexts.set(context, messageContext);
    return messageContext;
};

TDS.Messages.MessageSystem.prototype.getContexts = function() { return this._messageContexts.getValues(); };

TDS.Messages.MessageSystem.prototype.getContext = function(context /*string*/)
{
    return this._messageContexts.get(context);
};

TDS.Messages.MessageSystem.prototype.getTranslation = function(context, defaultMessage, languageCode, subject, gradeCode)
{
    var messageContext = this.getContext(context);

    if (messageContext != null)
    {
        var message = messageContext.getMessage(defaultMessage);

        if (message != null)
        {
            /* TODO: Fix multi dim array lookup
            var messageIndex = this._messageIndexer.get(languageCode, subject, gradeCode);
            return message.getTranslationByIndex(messageIndex);
            */

            return message.getTranslationByLang(languageCode);
        }
    }

    return null;
};

// find a translation just by its defaultmessage
TDS.Messages.MessageSystem.prototype.findTranslation = function(defaultMessage)
{
    var translation = null;
    var language = this._getLanguage();
    var contexts = this.getContexts();

    for (var i = 0; i < contexts.length; i++)
    {
        var context = contexts[i];
        translation = this.getTranslation(context.getName(), defaultMessage, language, null, null);
        if (translation != null) break;
    }

    return translation;
};


// translation text by context 
TDS.Messages.MessageSystem.prototype.getTextByContext = function(context, defaultMessage)
{
    var language = this._getLanguage();
    var translation = this.getTranslation(context, defaultMessage, language, null, null);

    if (translation) return translation.getClientMessage();
    return defaultMessage;
};


// get simple json
TDS.Messages.MessageSystem.prototype.getTemplateData = function()
{
    //var language = this._getLanguage(); //commented out for SB-350
	var language = TDS.getLanguage(); //updated for SB-350 to use current language selected
	
    var templateData = {};

    // build lookup for each message
    Util.Array.each(this.getContexts(), function(messageContext)
    {
        Util.Array.each(messageContext.getMessages(), function(message)
        {
            var translation = message.getTranslationByLang(language);
            templateData[message.getDefaultMessage()] = translation.getClientMessage();
        });
    });

    return templateData;
};
