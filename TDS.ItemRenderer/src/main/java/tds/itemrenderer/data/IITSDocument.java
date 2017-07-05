package tds.itemrenderer.data;

import java.util.List;

import tds.itempreview.content.ITSDocumentExtensions;

public class IITSDocument {
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
}
