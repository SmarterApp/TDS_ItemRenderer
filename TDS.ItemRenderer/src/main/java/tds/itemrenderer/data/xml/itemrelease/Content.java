/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.xml.itemrelease;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlAnyElement;

import org.w3c.dom.Element;

/**
 * @author jmambo
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "qti",
    "title",
    "author",
    "concept",
    "es",
    "himi",
    "rationaleoptlist",
    "attachmentlist",
    "illustration",
    "illustrationTts",
    "stem",
    "stemTts",
    "optionlist",
    "rubriclist",
    "keyboard",
    "apipAccessibility",
    "constraints",
    "search"
})
@XmlRootElement(name = "content")
public class Content {

    @XmlElement(required = true)
    protected Qti qti;
    @XmlElement(required = true)
    protected String title;
    @XmlElement(required = true)
    protected String author;
    @XmlElement(required = true)
    protected Concept concept;
    @XmlElement(required = true)
    protected Es es;
    @XmlElement(required = true)
    protected Himi himi;
    @XmlElement(required = true)
    protected Rationaleoptlist rationaleoptlist;
    @XmlElement(required = true)
    protected Attachmentlist attachmentlist;
    @XmlElement(required = true)
    protected String illustration;
    @XmlElement(name = "illustration_tts", required = true)
    protected String illustrationTts;
    @XmlElement(required = true)
    protected String stem;
    @XmlElement(name = "stem_tts")
    protected String stemTts;
    protected Optionlist optionlist;
    @XmlElement(required = true)
    protected Rubriclist rubriclist;
    @XmlElement(required = true)
    protected Keyboard keyboard;
    @XmlElement(required = true)
    protected ApipAccessibility apipAccessibility;
    @XmlAttribute(name = "format")
    protected String format;
    @XmlAttribute(name = "language", required = true)
    protected String language;
    @XmlAttribute(name = "version", required = true)
    protected String version;
    @XmlAnyElement
    protected Element constraints;
    @XmlAnyElement
    protected Element search;
    
    /**
     * Gets the value of the qti property.
     * 
     * @return
     *     possible object is
     *     {@link Qti }
     *     
     */
    public Qti getQti() {
        return qti;
    }

    /**
     * Sets the value of the qti property.
     * 
     * @param value
     *     allowed object is
     *     {@link Qti }
     *     
     */
    public void setQti(Qti value) {
        this.qti = value;
    }

    /**
     * Gets the value of the title property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the value of the title property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setTitle(String value) {
        this.title = value;
    }

    /**
     * Gets the value of the author property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAuthor() {
        return author;
    }

    /**
     * Sets the value of the author property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAuthor(String value) {
        this.author = value;
    }

    /**
     * Gets the value of the concept property.
     * 
     * @return
     *     possible object is
     *     {@link Concept }
     *     
     */
    public Concept getConcept() {
        return concept;
    }

    /**
     * Sets the value of the concept property.
     * 
     * @param value
     *     allowed object is
     *     {@link Concept }
     *     
     */
    public void setConcept(Concept value) {
        this.concept = value;
    }

    /**
     * Gets the value of the es property.
     * 
     * @return
     *     possible object is
     *     {@link Es }
     *     
     */
    public Es getEs() {
        return es;
    }

    /**
     * Sets the value of the es property.
     * 
     * @param value
     *     allowed object is
     *     {@link Es }
     *     
     */
    public void setEs(Es value) {
        this.es = value;
    }

    /**
     * Gets the value of the himi property.
     * 
     * @return
     *     possible object is
     *     {@link Himi }
     *     
     */
    public Himi getHimi() {
        return himi;
    }

    /**
     * Sets the value of the himi property.
     * 
     * @param value
     *     allowed object is
     *     {@link Himi }
     *     
     */
    public void setHimi(Himi value) {
        this.himi = value;
    }

    /**
     * Gets the value of the rationaleoptlist property.
     * 
     * @return
     *     possible object is
     *     {@link Rationaleoptlist }
     *     
     */
    public Rationaleoptlist getRationaleoptlist() {
        return rationaleoptlist;
    }

    /**
     * Sets the value of the rationaleoptlist property.
     * 
     * @param value
     *     allowed object is
     *     {@link Rationaleoptlist }
     *     
     */
    public void setRationaleoptlist(Rationaleoptlist value) {
        this.rationaleoptlist = value;
    }

    /**
     * Gets the value of the attachmentlist property.
     * 
     * @return
     *     possible object is
     *     {@link Attachmentlist }
     *     
     */
    public Attachmentlist getAttachmentlist() {
        return attachmentlist;
    }

    /**
     * Sets the value of the attachmentlist property.
     * 
     * @param value
     *     allowed object is
     *     {@link Attachmentlist }
     *     
     */
    public void setAttachmentlist(Attachmentlist value) {
        this.attachmentlist = value;
    }

    /**
     * Gets the value of the illustration property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getIllustration() {
        return illustration;
    }

    /**
     * Sets the value of the illustration property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setIllustration(String value) {
        this.illustration = value;
    }

    /**
     * Gets the value of the illustrationTts property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getIllustrationTts() {
        return illustrationTts;
    }

    /**
     * Sets the value of the illustrationTts property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setIllustrationTts(String value) {
        this.illustrationTts = value;
    }

    /**
     * Gets the value of the stem property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStem() {
        return stem;
    }

    /**
     * Sets the value of the stem property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStem(String value) {
        this.stem = value;
    }

    /**
     * Gets the value of the stemTts property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStemTts() {
        return stemTts;
    }

    /**
     * Sets the value of the stemTts property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStemTts(String value) {
        this.stemTts = value;
    }

    /**
     * Gets the value of the optionlist property.
     * 
     * @return
     *     possible object is
     *     {@link Optionlist }
     *     
     */
    public Optionlist getOptionlist() {
        return optionlist;
    }

    /**
     * Sets the value of the optionlist property.
     * 
     * @param value
     *     allowed object is
     *     {@link Optionlist }
     *     
     */
    public void setOptionlist(Optionlist value) {
        this.optionlist = value;
    }

    /**
     * Gets the value of the rubriclist property.
     * 
     * @return
     *     possible object is
     *     {@link Rubriclist }
     *     
     */
    public Rubriclist getRubriclist() {
        return rubriclist;
    }

    /**
     * Sets the value of the rubriclist property.
     * 
     * @param value
     *     allowed object is
     *     {@link Rubriclist }
     *     
     */
    public void setRubriclist(Rubriclist value) {
        this.rubriclist = value;
    }

    /**
     * Gets the value of the keyboard property.
     * 
     * @return
     *     possible object is
     *     {@link Keyboard }
     *     
     */
    public Keyboard getKeyboard() {
        return keyboard;
    }

    /**
     * Sets the value of the keyboard property.
     * 
     * @param value
     *     allowed object is
     *     {@link Keyboard }
     *     
     */
    public void setKeyboard(Keyboard value) {
        this.keyboard = value;
    }

    /**
     * Gets the value of the apipAccessibility property.
     * 
     * @return
     *     possible object is
     *     {@link ApipAccessibility }
     *     
     */
    public ApipAccessibility getApipAccessibility() {
        return apipAccessibility;
    }

    /**
     * Sets the value of the apipAccessibility property.
     * 
     * @param value
     *     allowed object is
     *     {@link ApipAccessibility }
     *     
     */
    public void setApipAccessibility(ApipAccessibility value) {
        this.apipAccessibility = value;
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
     * Gets the value of the language property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLanguage() {
        return language;
    }

    /**
     * Sets the value of the language property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLanguage(String value) {
        this.language = value;
    }

    /**
     * Gets the value of the version property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVersion() {
        return version;
    }

    /**
     * Sets the value of the version property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVersion(String value) {
        this.version = value;
    }

    /**
     * @return the constraints
     */
    public Element getConstraints () {
      return constraints;
    }

    /**
     * @param constraints the constraints to set
     */
    public void setConstraints (Element constraints) {
      this.constraints = constraints;
    }

    /**
     * @return the search
     */
    public Element getSearch () {
      return search;
    }

    /**
     * @param search the search to set
     */
    public void setSearch (Element search) {
      this.search = search;
    }

    
}
