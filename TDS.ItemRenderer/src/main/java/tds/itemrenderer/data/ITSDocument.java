package tds.itemrenderer.data;

import AIR.Common.Helpers.CaseInsensitiveMap;
import AIR.Common.Helpers._Ref;
import org.apache.commons.lang.StringUtils;

import java.util.ArrayList;
import java.util.List;

import tds.itempreview.content.ITSDocumentExtensions;

public class ITSDocument {
    protected String          _baseUri;        // The original file path of where
    // the XML data came from.
    private String            _rendererSpec;
    private String            _layout;
    private String            _format;
    private String            _responseType;
    private String            _subject;
    private String            _grade;
    private String            _answerKey;
    private String            _credit;
    private String            _copyright;
    private String            _gridAnswerSpace; // This is the new top level grid
    // answer space. This replaces the
    // content element level answer
    // space.
    private ITSTypes.ITSEntityType _type;           // What type of entity this is.
    // This can be item or passage.
    private ITSSoundCue       _soundCue;
    private ITSTutorial       _tutorial;
    private List<ITSResource> _resources;
    private ITSMachineRubric  _machineRubric;
    private long              _bankKey;
    private long              _itemKey;
    private long              _stimulusKey;
    private boolean           _isLoaded;       // Is the XML loaded and parsed.
    private boolean           _autoEmboss;
    private long                                         _id;

    private String _realPath;

    private double                                       _version;
    private boolean                                      _validated;
    private int                                          _approvedVersion;

    private final List<String>                           _mediaFiles = new ArrayList<String> ();


    protected final CaseInsensitiveMap<ITSContent>         _contents   = new CaseInsensitiveMap<ITSContent> ();
    private final CaseInsensitiveMap<List<ITSAttribute>> _attributes = new CaseInsensitiveMap<List<ITSAttribute>> ();

    public String getID () {
        return ITSDocumentExtensions.getID (this);
    }

    public long getId () {
        return _id;
    }

    public void setId (long value) {
        this._id = value;
    }

    public String getLayout() {
        return _layout;
    }

    public void setLayout(String _layout) {
        this._layout = _layout;
    }

    public String getBaseUri() {
        return _baseUri;
    }

    public void setBaseUri(String _baseUri) {
        this._baseUri = _baseUri;
    }

    public String getRendererSpec() {
        return _rendererSpec;
    }

    public void setRendererSpec(String _rendererSpec) {
        this._rendererSpec = _rendererSpec;
    }

    public void setFormat(String _format) {
        this._format = _format;
    }

    public void setResponseType(String _responseType) {
        this._responseType = _responseType;
    }

    public void setSubject(String _subject) {
        this._subject = _subject;
    }


    public void setGrade(String _grade) {
        this._grade = _grade;
    }

    public String getAnswerKey() {
        return _answerKey;
    }

    public void setAnswerKey(String _answerKey) {
        this._answerKey = _answerKey;
    }

    public String getCredit() {
        return _credit;
    }

    public void setCredit(String _credit) {
        this._credit = _credit;
    }

    public void setCopyright(String _copyright) {
        this._copyright = _copyright;
    }

    public String getGridAnswerSpace() {
        return _gridAnswerSpace;
    }

    public void setGridAnswerSpace(String _gridAnswerSpace) {
        this._gridAnswerSpace = _gridAnswerSpace;
    }

    public ITSTypes.ITSEntityType getType() {
        return _type;
    }

    public void setType(ITSTypes.ITSEntityType _type) {
        this._type = _type;
    }

    public ITSSoundCue getSoundCue() {
        return _soundCue;
    }

    public void setSoundCue(ITSSoundCue _soundCue) {
        this._soundCue = _soundCue;
    }

    public ITSTutorial getTutorial() {
        return _tutorial;
    }

    public void setTutorial(ITSTutorial _tutorial) {
        this._tutorial = _tutorial;
    }

    public List<ITSResource> getResources() {
        return _resources;
    }

    public void setResources(List<ITSResource> _resources) {
        this._resources = _resources;
    }

    public ITSMachineRubric getMachineRubric() {
        return _machineRubric;
    }

    public void setMachineRubric(ITSMachineRubric _machineRubric) {
        this._machineRubric = _machineRubric;
    }

    public long getBankKey() {
        return _bankKey;
    }

    public void setBankKey(long _bankKey) {
        this._bankKey = _bankKey;
    }

    public void setItemKey(long _itemKey) {
        this._itemKey = _itemKey;
    }

    public long getStimulusKey() {
        return _stimulusKey;
    }

    public void setStimulusKey(long _stimulusKey) {
        this._stimulusKey = _stimulusKey;
    }

    public boolean getIsLoaded() {
        return _isLoaded;
    }

    public void setIsLoaded(boolean _isLoaded) {
        this._isLoaded = _isLoaded;
    }

    public boolean isAutoEmboss() {
        return _autoEmboss;
    }

    public void setAutoEmboss(boolean _autoEmboss) {
        this._autoEmboss = _autoEmboss;
    }

    public long get_id() {
        return _id;
    }

    public void set_id(long _id) {
        this._id = _id;
    }

    public CaseInsensitiveMap<List<ITSAttribute>> get_attributes() {
        return _attributes;
    }

    public void addAttribute (ITSAttribute attribute) {

        List<ITSAttribute> attribList = null;
        _Ref<List<ITSAttribute>> attribListRef = new _Ref<List<ITSAttribute>> ();

        boolean attribExist = _attributes.tryGetValue (attribute.getId (), attribListRef);

        if (!attribExist) {
            attribList = new ArrayList<ITSAttribute>();
            _attributes.put (attribute.getId (), attribList);
        } else
            attribList = attribListRef.get ();

        attribList.add (attribute);

    }

    public boolean hasAttribute (String attid) {
        return _attributes.containsKey (attid);
    }

    public ITSAttribute createAttribute (String id, String value) {
        ITSAttribute itsAttrib = new ITSAttribute (id, value);
        addAttribute (itsAttrib);
        return itsAttrib;
    }

    private List<ITSAttribute> getAttributes (String attid) {

        _Ref<List<ITSAttribute>> attribList = new _Ref<List<ITSAttribute>> ();

        boolean attribExist = _attributes.tryGetValue (attid, attribList);

        if (!attribExist || attribList.get () == null || attribList.get ().size () == 0) {
            return null;
        }

        return attribList.get ();
    }

    protected ITSAttribute getAttribute (String attid) {
        List<ITSAttribute> attribList = getAttributes (attid);
        return (attribList == null) ? null : attribList.get (0);
    }

    public ITSAttribute setAttributeValue (String id, String value) {
        ITSAttribute attrib;

        if (hasAttribute (id)) {
            attrib = getAttribute (id);
            attrib.setValue (value);
        } else {
            attrib = createAttribute (id, value);
        }

        return attrib;
    }

    public String getAttributeValue (String attid) {
        ITSAttribute attribute = getAttribute (attid);
        return (attribute == null) ? "" : attribute.getValue ();
    }



    public long getItemKey () {
        return getId ();
    }

    public void setItemKey (Long value) {
        setId (value);
    }


    public String getLayout2 () {
        if (!StringUtils.isEmpty (getLayout ()))
            return getLayout ();
        // If there is no response type then it is the older item format
        if (StringUtils.isEmpty (getResponseType ())) {
            return getAttributeValue ("itm_att_Item Layout");
        }
        return getAttributeValue ("itm_att_Page Layout");
    }

    public void setAttributeFormat (String value) {
        setAttributeValue ("itm_att_Item Format", value);
    }

    public void setAttributeResponseType (String value) {
        setAttributeValue ("itm_att_Response Type", value);
    }

    public String getResponseType () {
        return getAttributeValue ("itm_att_Response Type");
    }


    public String getSubject () {
        return getAttributeValue ("itm_item_subject");
    }


    public String getGrade () {
        return getAttributeValue ("itm_att_Grade");
    }


    public String getCopyright () {
        return getAttributeValue ("itm_att_Copyright text");
    }

    public String getFormat ()
    {
        return getAttributeValue ("itm_att_Item Format");
    }

    /*
 * The XML content nodes. These come internally from a dictionary so the order
 * of the content nodes is not guaranteed to be the same as the original XML.
 */
    public List<ITSContent> getContents () {
        List<ITSContent> contents = new ArrayList<ITSContent> ();

        for (ITSContent content : _contents.values ()) {
            contents.add (content);
        }

        return contents;
    }

    public ITSContent getContent (String language) {
        if (StringUtils.isEmpty (language))
            return null;

        _Ref<ITSContent> content = new _Ref<ITSContent> ();

        // get language
        _contents.tryGetValue (language, content);

        // if language does not exist try splitting language
        if (content.get () == null && language.indexOf ('-') != -1) {
            String[] langTags = StringUtils.split (language, '-');

            if (langTags.length > 1) {
                _contents.tryGetValue (langTags[0], content);
            }
        }

        return content.get ();
    }

    public void addContent (ITSContent content) {
        if (content.getLanguage () == null) {
            throw new InvalidDataException ("Could not add the <content> element because it is missing the language attribute.");
        }

        _contents.put (content.getLanguage (), content);
    }

    public void addMediaFiles (List<String> capturedResources) {
        _mediaFiles.addAll (capturedResources);
        // _mediaFiles.AddRange(capturedResources);
    }

    public String getGroupID () {
        return ITSDocumentExtensions.getGroupID (this);
    }

    public String[] getBaseUriDirSegments () {
        return ITSDocumentExtensions.getBaseUriDirSegments (this);
    }

    public String getFolderName () {
        return ITSDocumentExtensions.getFolderName (this);
    }

    public String getParentFolderName () {
        return ITSDocumentExtensions.getParentFolderName (this);
    }

    public String getRealPath () {
        return _realPath;
    }

    public void setRealPath (String value) {
        this._realPath = value;
    }

    public boolean getValidated () {
        return _validated;
    }

    public double getVersion () {
        return _version;
    }

    public void setVersion (double value) {
        this._version = value;
    }


    public void setValidated (boolean value) {
        this._validated = value;
    }


    public void setApprovedVersion (int value) {
        this._approvedVersion = value;
    }

}
