package tds.itemrenderer.data;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface IITSDocument {
    /**
     * Location of the assessment item
     *
     * @return location of assessment item
     */
    String getBaseUri();

    void setBaseUri(String baseUri);

    /**
     * Rendering specification used to render the item on the test client device
     * RendererSpec is present only if the format attribute value is eq (equation item)
     *
     * @return file name for the rendering specification
     */
    String getRendererSpec();

    void setRendererSpec(String rendererSpec);

    /**
     * Type of the item.
     *
     * The list of item types:
     *
     * Value    - Description  <br/>
     * EBSR     - Evidence-Based Selected Response item.  <br/>
     * eq       - Equation item  <br/>
     * er       - Extended Response item  <br/>
     * gi       - Grid item  <br/>
     * htq      - Hot Text itemice item  <br/>
     * mc       - Multiple Cho  <br/>
     * mi       - Match Interaction item  <br/>
     * ms       - Multi-Select item  <br/>
     * nl       - Natural Language item  <br/>
     * pass     - Passage item  <br/>
     * sa       - Short Answer item  <br/>
     * SIM      - Simulation item  <br/>
     * ti       - Table Interaction item  <br/>
     * tut      - Tutorial item  <br/>
     * wer      - Writing Extended Response item  <br/>
     * wordList - Wordlist resource  <br/>
     *
     *  All types of items except Wordlist items indicate the item type
     *  with the format attribute. WordList is included in the vocabulary
     *  but is not used as a value of format.
     *  It is included to permit the type attribute TO BE DEPRECATED and
     *  replaced by the format attribute.
     *
     * @return Type of the item
     */
    String getFormat();

    void setFormat(String format);

    /**
     * The layout file used to render the item.
     *
     * @return layout file
     */
    String getLayout();

    void setLayout(String layout);

    /**
     * The container for the Grid Item Rendering Specification XML document elements.
     *
     * gridaswerspace element is present only if the format attribute is "gi"
     *
     * @return gridaswerspace element
     */
    String getGridAnswerSpace();

    void setGridAnswerSpace(String gridAnswerSpace);

    /**
     * The type (passage or item) of this item.
     *
     * @return
     */
    ITSTypes.ITSEntityType getType();

    void setType(ITSTypes.ITSEntityType type);

    /**
     * Sound cue resource
     *
     * @return
     */
    ITSSoundCue getSoundCue();

    void setSoundCue(ITSSoundCue soundCue);


    /**
     * Tutorial resource
     *
     * @return
     */
    ITSTutorial getTutorial();

    void setTutorial(ITSTutorial tutorial);

    /**
     * Additional resources for an item.
     * The resource is described in an XML document specific to the type of resource.
     *
     * @return
     */
    List<ITSResource> getResources();

    void setResources(List<ITSResource> resources);

    /**
     * An assessment item may include a machine rubric used to control how the item is automatically graded.
     * Machine rubrics are present only for assessment items that are automatically graded.
     * The machine rubric is stored separately from the assessment item and each of the different types of machine rubrics
     * is defined by its own Assessment Item Machine Rubric XML document elements.
     *
     * @return machine rubric
     */
    ITSMachineRubric getMachineRubric();

    void setMachineRubric(ITSMachineRubric machineRubric);

    /**
     * Item bank that the resource is stored in.
     * Bankkey is a candidate to be deprecated.
     *
     * @return bankkey
     */
    long getBankKey();

    void setBankKey(long bankKey);

    boolean getIsLoaded();

    void setIsLoaded(boolean isLoaded);

    /**
     * Version identifier for the item as part of the release.
     *
     * Read from the version attribute of the item release xml document.
     *
     * @return version
     */
    double getVersion();

    void setVersion(double version);

    boolean getValidated();

    void setValidated(boolean validated);

    /**
     * Version identifier for the item content.
     *
     * The value of the approvedVersion attribute should match
     * the value of the version attribute of the item element.
     *
     * @return version
     */
    int getApprovedVersion();

    void setApprovedVersion(int approvedVersion);

    /**
     * Unique item number for the item
     *
     * @return
     */
    long getId();

    void setId(long value);

    Map<String, List<ITSAttribute>> getAttributes();

    void setAttributes(HashMap<String, List<ITSAttribute>> attributes);

    /**
     * Content of an assessment item.
     *
     * @return
     */
    Map<String, ITSContent> getContents();

    void setContents(HashMap<String, ITSContent> contents);

    List<String> getMediaFiles();

    void setMediaFiles(List<String> mediaFiles);

    void addAttribute(ITSAttribute attribute);

    String getAttributeValue(String attid);

    ITSContent getContent(String language);

    void addContent(ITSContent content);

    ITSContent getContentDefault();

    /**
     * Unique item number for the item
     *
     * @return item key
     */
    long getItemKey();

    /**
     * The item number of the associated stimulus passage.
     *
     * Read from the stm_pass_id item attribute
     *
     * @return
     */
    long getStimulusKey();

    void setAttributeResponseType(String value);

    /**
     *  The rendering of the item.<br/>
     *
     *  Item Format to itm_att_Response Type Value Mapping <br/>
     *  Item Format - Response Type <br/>
     *  EBSR        - EBSR <br/>
     *  eq          - EquationEditor <br/>
     *  er          - PlainText <br/>
     *  gi          - Grid <br/>
     *  htq         - HotText <br/>
     *  mc          - Vertical / Stacked <br/>
     *  mi          - TableMatch / MatchItem <br/>
     *  ms          - Vertical MS <br/>
     *  nl          - PlainText <br/>
     *  pass        - NA <br/>
     *  sa          - PlainText <br/>
     *  SIM         - NA <br/>
     *  ti          - TableInput <br/>
     *  tut         - NA <br/>
     *  wer         - HTMLEditor NA <br/>
     *  wordList    - NA <br/>
     *  @return Rendering code
     */
    String getResponseType();

    /**
     * The subject of the item.
     * "itm_item_subject" item attribute
     *
     * @return
     */
    String getSubject();

    /**
     * Grade level for the item.
     * "itm_att_Grade" item attribute
     *
     * @return
     */
    String getGrade();

    /**
     * The item rubric
     * "itm_att_Answer Key" item attribute
     *
     * @return
     */
    String getAnswerKey();

    /**
     * "stm_att_Credit Line" item attribute
     * @return
     */
    String getCredit();

    /**
     * "itm_att_Copyright text" item attribute
     * @return
     */
    String getCopyright();

    /**
     * For items, true if "itm_att_Rendering Guide" equals "AutoEmboss"
     * For passages, true if "stm_att_Rendering Guide" equals "AutoEmboss"
     * @return
     */
    boolean isAutoEmboss();

    /**
     * "itm_att_Max Item Score" item attribute
     * @return
     */
    int getMaxScore();

    /**
     * The XML content nodes. These come internally from a dictionary so the order
     * of the content nodes is not guaranteed to be the same as the original XML.
     */
    @JsonIgnore
    List<ITSContent> getContentsValues();

    void addMediaFiles(List<String> capturedResources);

    String[] getBaseUriDirSegments();

    String getFolderName();

    String getGroupID();

    String getID();

    String getParentFolderName();

    String getRealPath();

    void setRealPath(String value);
}
