package tds.itemrenderer.data;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface IITSDocument {
    String getBaseUri();

    void setBaseUri(String baseUri);

    String getRendererSpec();

    void setRendererSpec(String rendererSpec);

    String getFormat();

    void setFormat(String format);

    String getLayout();

    void setLayout(String layout);

    String getGridAnswerSpace();

    void setGridAnswerSpace(String gridAnswerSpace);

    ITSTypes.ITSEntityType getType();

    void setType(ITSTypes.ITSEntityType type);

    ITSSoundCue getSoundCue();

    void setSoundCue(ITSSoundCue soundCue);

    ITSTutorial getTutorial();

    void setTutorial(ITSTutorial tutorial);

    List<ITSResource> getResources();

    void setResources(List<ITSResource> resources);

    ITSMachineRubric getMachineRubric();

    void setMachineRubric(ITSMachineRubric machineRubric);

    long getBankKey();

    void setBankKey(long bankKey);

    boolean getIsLoaded();

    void setIsLoaded(boolean isLoaded);

    double getVersion();

    void setVersion(double version);

    boolean getValidated();

    void setValidated(boolean validated);

    int getApprovedVersion();

    void setApprovedVersion(int approvedVersion);

    long getId();

    void setId(long value);

    Map<String, List<ITSAttribute>> getAttributes();

    void setAttributes(HashMap<String, List<ITSAttribute>> attributes);

    Map<String, ITSContent> getContents();

    void setContents(HashMap<String, ITSContent> contents);

    List<String> getMediaFiles();

    void setMediaFiles(List<String> mediaFiles);

    void addAttribute(ITSAttribute attribute);

    String getAttributeValue(String attid);

    ITSContent getContent(String language);

    void addContent(ITSContent content);

    ITSContent getContentDefault();

    long getItemKey();

    long getStimulusKey();

    String getAttributeFormat();

    void setAttributeResponseType(String value);

    String getResponseType();

    String getSubject();

    String getGrade();

    String getAnswerKey();

    String getCredit();

    String getCopyright();

    boolean isAutoEmboss();

    int getMaxScore();

    /*
         * The XML content nodes. These come internally from a dictionary so the order
         * of the content nodes is not guaranteed to be the same as the original XML.
        */
    @JsonIgnore
    List<ITSContent> getContentsValues();

    void addMediaFiles(List<String> capturedResources);

    String[] getBaseUriDirSegments();

    String getFolderName();

    String getGroupID();

    String getIDString();

    String getParentFolderName();

    String getRealPath();

    void setRealPath(String value);
}
