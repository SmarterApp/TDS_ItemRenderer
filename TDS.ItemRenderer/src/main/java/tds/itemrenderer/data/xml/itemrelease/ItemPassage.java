/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.xml.itemrelease;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

/**
 * @author jmambo
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "associatedpassage",
    "attriblist",
    "soundcue",
    "tutorial",
    "resourceslist",
    "machineRubric",
    "rendererSpec",
    "gridanswerspace",
    "statistic",
    "content",
    "samplelist"
})
public abstract class ItemPassage {

    @XmlElement(required = true)
    protected String associatedpassage;
    @XmlElement(required = true)
    protected Attriblist attriblist;
    @XmlElement(required = true)
    protected Tutorial tutorial;
    @XmlElement(required = true)
    protected Soundcue soundcue;
    @XmlElement(required = true)
    protected Resourceslist resourceslist;
    @XmlElement(name = "MachineRubric", required = true)
    protected MachineRubric machineRubric;
    @XmlElement(name = "RendererSpec", required = true)
    protected RendererSpec rendererSpec;
    @XmlElement(required = true)
    protected String gridanswerspace;
    @XmlElement(required = true)
    protected String statistic;
    @XmlElement(required = true)
    protected List<Content> content;
    @XmlElement(required = true)
    protected Samplelist samplelist;
    @XmlAttribute(name = "bankkey", required = true)
    protected String bankkey;
    @XmlAttribute(name = "format", required = true)
    protected String format;
    @XmlAttribute(name = "id", required = true)
    protected String id;
    @XmlAttribute(name = "version", required = true)
    protected String version;

    /**
     * Gets the value of the associatedpassage property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAssociatedpassage() {
        return associatedpassage;
    }

    /**
     * Sets the value of the associatedpassage property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAssociatedpassage(String value) {
        this.associatedpassage = value;
    }

    /**
     * Gets the value of the attriblist property.
     * 
     * @return
     *     possible object is
     *     {@link Attriblist }
     *     
     */
    public Attriblist getAttriblist() {
        return attriblist;
    }

    /**
     * Sets the value of the attriblist property.
     * 
     * @param value
     *     allowed object is
     *     {@link Attriblist }
     *     
     */
    public void setAttriblist(Attriblist value) {
        this.attriblist = value;
    }

    /**
     * Gets the value of the tutorial property.
     * 
     * @return
     *     possible object is
     *     {@link Tutorial }
     *     
     */
    public Tutorial getTutorial() {
        return tutorial;
    }

    /**
     * Sets the value of the tutorial property.
     * 
     * @param value
     *     allowed object is
     *     {@link Tutorial }
     *     
     */
    public void setTutorial(Tutorial value) {
        this.tutorial = value;
    }
    
    
    /**
     * Gets the value of the soundcue property.
     * 
     * @return
     *     possible object is
     *     {@link Soundcue }
     *     
     */
    public Soundcue getSoundcue() {
        return soundcue;
    }

    /**
     * Sets the value of the soundcue property.
     * 
     * @param value
     *     allowed object is
     *     {@link Soundcue }
     *     
     */
    public void setSoundcue(Soundcue value) {
        this.soundcue = value;
    }
    

    /**
     * Gets the value of the resourceslist property.
     * 
     * @return
     *     possible object is
     *     {@link Resourceslist }
     *     
     */
    public Resourceslist getResourceslist() {
        return resourceslist;
    }

    /**
     * Sets the value of the resourceslist property.
     * 
     * @param value
     *     allowed object is
     *     {@link Resourceslist }
     *     
     */
    public void setResourceslist(Resourceslist value) {
        this.resourceslist = value;
    }

    /**
     * Gets the value of the machineRubric property.
     * 
     * @return
     *     possible object is
     *     {@link MachineRubric }
     *     
     */
    public MachineRubric getMachineRubric() {
        return machineRubric;
    }

    /**
     * Sets the value of the machineRubric property.
     * 
     * @param value
     *     allowed object is
     *     {@link MachineRubric }
     *     
     */
    public void setMachineRubric(MachineRubric value) {
        this.machineRubric = value;
    }

    /**
     * Gets the value of the rendererSpec property.
     * 
     * @return
     *     possible object is
     *     {@link RendererSpec }
     *     
     */
    public RendererSpec getRendererSpec() {
        return rendererSpec;
    }

    /**
     * Sets the value of the rendererSpec property.
     * 
     * @param value
     *     allowed object is
     *     {@link RendererSpec }
     *     
     */
    public void setRendererSpec(RendererSpec value) {
        this.rendererSpec = value;
    }

    /**
     * Gets the value of the gridanswerspace property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getGridanswerspace() {
        return gridanswerspace;
    }

    /**
     * Sets the value of the gridanswerspace property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setGridanswerspace(String value) {
        this.gridanswerspace = value;
    }

    /**
     * Gets the value of the statistic property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStatistic() {
        return statistic;
    }

    /**
     * Sets the value of the statistic property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStatistic(String value) {
        this.statistic = value;
    }

    /**
     * Gets the value of the content property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the content property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getContent().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Content }
     * 
     * 
     */
    public List<Content> getContent() {
        if (content == null) {
            content = new ArrayList<Content>();
        }
        return this.content;
    }

    /**
     * Gets the value of the samplelist property.
     * 
     * @return
     *     possible object is
     *     {@link Samplelist }
     *     
     */
    public Samplelist getSamplelist() {
        return samplelist;
    }

    /**
     * Sets the value of the samplelist property.
     * 
     * @param value
     *     allowed object is
     *     {@link Samplelist }
     *     
     */
    public void setSamplelist(Samplelist value) {
        this.samplelist = value;
    }

    /**
     * Gets the value of the bankkey property.
     * 
     */
    public String getBankkey() {
        return bankkey;
    }

    /**
     * Sets the value of the bankkey property.
     * 
     */
    public void setBankkey(String value) {
        this.bankkey = value;
    }

    /**
     * Gets the value of the format property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getFormat() {
        return format;
    }

    /**
     * Sets the value of the format property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setFormat(String value) {
        this.format = value;
    }

    /**
     * Gets the value of the id property.
     * 
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the value of the id property.
     * 
     */
    public void setId(String value) {
        this.id = value;
    }

    /**
     * Gets the value of the version property.
     * 
     */
    public String getVersion() {
        return version;
    }

    /**
     * Sets the value of the version property.
     * 
     */
    public void setVersion(String value) {
        this.version = value;
    }

}
