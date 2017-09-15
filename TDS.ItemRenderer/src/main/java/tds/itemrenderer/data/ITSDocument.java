/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 *
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/

package tds.itemrenderer.data;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang.StringUtils;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

// Represents ITS XML data and well known attributes.
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE, setterVisibility = NONE)
public class ITSDocument implements IITSDocument {
    private static final String ITM_ATT_ITEM_LAYOUT = "itm_att_Item Layout";
    private static final String ITM_ATT_PAGE_LAYOUT = "itm_att_Page Layout";
    private static final String STM_PASS_ID = "stm_pass_id";
    private static final String ITM_ATT_ITEM_FORMAT = "itm_att_Item Format";
    private static final String ITM_ATT_RESPONSE_TYPE = "itm_att_Response Type";
    private static final String ITM_ATT_RESPONSE_TYPE1 = "itm_att_Response Type";
    private static final String ITM_ITEM_SUBJECT = "itm_item_subject";
    private static final String ITM_ATT_GRADE = "itm_att_Grade";
    private static final String ITM_ATT_ANSWER_KEY = "itm_att_Answer Key";
    private static final String STM_ATT_CREDIT_LINE = "stm_att_Credit Line";
    private static final String ITM_ATT_COPYRIGHT_TEXT = "itm_att_Copyright text";
    private static final String STM_ATT_RENDERING_GUIDE = "stm_att_Rendering Guide";
    private static final String ITM_ATT_RENDERING_GUIDE = "itm_att_Rendering Guide";
    private static final String ITM_ATT_MAX_ITEM_SCORE = "itm_att_Max Item Score";
    private static final String AUTO_EMBOSS = "AutoEmboss";
    // The original file path of where the XML data came from.
    private String baseUri;
    private String rendererSpec;
    private String layout;
    private String format;
    // This is the new top level grid answer space. This replaces the content element level answer space.
    private String gridAnswerSpace;
    // What type of entity this is.  This can be item or passage.
    private ITSTypes.ITSEntityType type;
    private ITSSoundCue soundCue;
    private ITSTutorial tutorial;
    private List<ITSResource> resources = new ArrayList<ITSResource>();
    private ITSMachineRubric machineRubric;
    private long bankKey;
    // Is the XML loaded and parsed.
    private boolean isLoaded;

    private double version;
    private boolean validated;
    private int approvedVersion;
    private long id;

    private Map<String, List<ITSAttribute>> attributes = new HashMap<>();
    private Map<String, ITSContent> contents = new HashMap<>();
    private List<String> mediaFiles = new ArrayList<>();

    private String realPath;

    public String getBaseUri() {
        return baseUri;
    }

    public void setBaseUri(String baseUri) {
        this.baseUri = baseUri;
    }

    public String getRendererSpec() {
        return rendererSpec;
    }

    public void setRendererSpec(String rendererSpec) {
        this.rendererSpec = rendererSpec;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getLayout() {
        if (!StringUtils.isEmpty(layout))
            return layout;
        // If there is no response type then it is the older item format
        if (StringUtils.isEmpty(getResponseType())) {
            return getAttributeValue(ITM_ATT_ITEM_LAYOUT);
        }
        return getAttributeValue(ITM_ATT_PAGE_LAYOUT);
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }

    public String getGridAnswerSpace() {
        return gridAnswerSpace;
    }

    public void setGridAnswerSpace(String gridAnswerSpace) {
        this.gridAnswerSpace = gridAnswerSpace;
    }

    public ITSTypes.ITSEntityType getType() {
        return type;
    }

    public void setType(ITSTypes.ITSEntityType type) {
        this.type = type;
    }

    public ITSSoundCue getSoundCue() {
        return soundCue;
    }

    public void setSoundCue(ITSSoundCue soundCue) {
        this.soundCue = soundCue;
    }

    public ITSTutorial getTutorial() {
        return tutorial;
    }

    public void setTutorial(ITSTutorial tutorial) {
        this.tutorial = tutorial;
    }

    public List<ITSResource> getResources() {
        return resources;
    }

    public void setResources(List<ITSResource> resources) {
        this.resources = resources;
    }

    public ITSMachineRubric getMachineRubric() {
        return machineRubric;
    }

    public void setMachineRubric(ITSMachineRubric machineRubric) {
        this.machineRubric = machineRubric;
    }

    public long getBankKey() {
        return bankKey;
    }

    public void setBankKey(long bankKey) {
        this.bankKey = bankKey;
    }

    public boolean getIsLoaded() {
        return isLoaded;
    }

    public void setIsLoaded(boolean isLoaded) {
        this.isLoaded = isLoaded;
    }

    public double getVersion() {
        return version;
    }

    public void setVersion(double version) {
        this.version = version;
    }

    public boolean getValidated() {
        return validated;
    }

    public void setValidated(boolean validated) {
        this.validated = validated;
    }

    public int getApprovedVersion() {
        return approvedVersion;
    }

    public void setApprovedVersion (int approvedVersion) {
        this.approvedVersion = approvedVersion;
    }

    public long getId() {
        return id;
    }

    public void setId(long value) {
        this.id = value;
    }

    public Map<String, List<ITSAttribute>> getAttributes() {
        return attributes;
    }

    public void setAttributes(HashMap<String, List<ITSAttribute>> attributes) {
        this.attributes = attributes;
    }

    public Map<String, ITSContent> getContents() {
        return contents;
    }

    public void setContents(HashMap<String, ITSContent> contents) {
        this.contents = contents;
    }

    public List<String> getMediaFiles() {
        return mediaFiles;
    }

    public void setMediaFiles(List<String> mediaFiles) {
        this.mediaFiles = mediaFiles;
    }

    public void addAttribute(ITSAttribute attribute) {
        final List<ITSAttribute> attribList = new ArrayList<>();
        attribList.add(attribute);

        attributes.merge(attribute.getId().toLowerCase(), attribList, (a, b) -> {
            a.addAll(b);
            return a;
        });
    }

    public String getAttributeValue(String attid) {
        final List<ITSAttribute> attribList = attributes.getOrDefault(attid.toLowerCase(), new ArrayList<>());
        return (attribList.size() > 0) ? attribList.get(0).getValue() : "";
    }

    private Optional<ITSAttribute> getAttribute(String id) {
        final List<ITSAttribute> attribList = attributes.getOrDefault(id.toLowerCase(), new ArrayList<>());
        return (attribList.size() > 0) ? Optional.of(attribList.get(0)) : Optional.empty();
    }

    private void setAttributeValue(String id, String value) {
        final Optional<ITSAttribute> attrib = getAttribute(id);
        if (attrib.isPresent()) {
            attrib.get().setValue(value);
        } else {
            addAttribute(new ITSAttribute(id, value));
        }
    }

    public ITSContent getContent(String language) {
        if (StringUtils.isEmpty(language))
            return null;

        // get language
        Optional<ITSContent> maybeContent = Optional.ofNullable(contents.get(language));

        // if language does not exist try splitting language
        if (!maybeContent.isPresent() && language.indexOf('-') != -1) {
            final String[] langTags = StringUtils.split(language, '-');

            if (langTags.length > 1) {
                maybeContent = Optional.ofNullable(contents.get(langTags[0]));
            }
        }

        return maybeContent.orElse(null);
    }

    public void addContent(ITSContent content) {
        if (content.getLanguage() == null) {
            throw new InvalidDataException("Could not add the <content> element because it is missing the language attribute.");
        }

        contents.put(content.getLanguage(), content);
    }

    public ITSContent getContentDefault() {
        return getContent ("ENU");
    }

    public long getItemKey() {
        return getId();
    }

    public long getStimulusKey () {
        String value = getAttributeValue (STM_PASS_ID);
        return StringUtils.isEmpty (value) ? 0 : Long.parseLong (value);
    }

    public String getAttributeFormat() {
        return getAttributeValue(ITM_ATT_ITEM_FORMAT);
    }

    public void setAttributeResponseType(String value) {
        setAttributeValue(ITM_ATT_RESPONSE_TYPE, value);
    }

    public String getResponseType() {
        return getAttributeValue(ITM_ATT_RESPONSE_TYPE1);
    }

    public String getSubject() {
        return getAttributeValue(ITM_ITEM_SUBJECT);
    }

    public String getGrade() {
        return getAttributeValue(ITM_ATT_GRADE);
    }

    public String getAnswerKey() {
        return getAttributeValue (ITM_ATT_ANSWER_KEY);
    }

    public String getCredit() {
        return getAttributeValue(STM_ATT_CREDIT_LINE);
    }

    public String getCopyright() {
        return getAttributeValue(ITM_ATT_COPYRIGHT_TEXT);
    }

    public boolean isAutoEmboss () {
        final String attid = (getStimulusKey () > 0) ? STM_ATT_RENDERING_GUIDE : ITM_ATT_RENDERING_GUIDE;
        final String renderingGuide = getAttributeValue(attid);
        return (renderingGuide != null && StringUtils.equalsIgnoreCase(renderingGuide, AUTO_EMBOSS));
    }

    public int getMaxScore() {
        final String value = getAttributeValue(ITM_ATT_MAX_ITEM_SCORE);
        int maxScore;
        try {
            maxScore = Integer.parseInt(value);
        } catch (NumberFormatException e) {
            maxScore = 0;
        }
        return maxScore;
    }

    /*
     * The XML content nodes. These come internally from a dictionary so the order
     * of the content nodes is not guaranteed to be the same as the original XML.
    */
    @JsonIgnore
    public List<ITSContent> getContentsValues() {
        return new ArrayList<>(contents.values());
    }

    public void addMediaFiles(List<String> capturedResources) {
        mediaFiles.addAll(capturedResources);
    }

    private String getDirectoryName(String path) {
        if (org.apache.commons.lang3.StringUtils.endsWith(path, "/") || org.apache.commons.lang3.StringUtils.endsWith(path, "\\"))
            return path.substring(0, path.length() - 1);
        return new File(path).getParent();
    }

    public String[] getBaseUriDirSegments() {
        final String baseDirectory = getDirectoryName(getBaseUri());

        final String delim = "/\\";
        return StringUtils.split(baseDirectory, delim);
    }

    public String getFolderName() {
        final String[] segments = getBaseUriDirSegments();
        final String segment = segments[segments.length - 1];
        return segment;
    }

    public String getGroupID() {
        final boolean hasPassage = (getStimulusKey() > 0);
        final String prefix = (hasPassage ? "G-" : "I-");
        final long itemKey = (hasPassage ? getStimulusKey() : getItemKey());
        return String.format("%s-%d-%d", prefix, getBankKey(), itemKey);
    }

    public String getIDString() {
        final String prefix = (getType() == ITSTypes.ITSEntityType.Passage) ? "G" : "I";
        return String.format("%s-%d-%d", prefix, getBankKey(), getItemKey());
    }

    public String getParentFolderName() {
        final String[] segments = getBaseUriDirSegments();
        final String segment = segments[segments.length - 2];
        return segment;
    }

    public String getRealPath() {
        return realPath;
    }

    public void setRealPath(String value) {
        this.realPath = value;
    }

    public String toString () {
        return baseUri == null ? "" : baseUri;
    }
}
