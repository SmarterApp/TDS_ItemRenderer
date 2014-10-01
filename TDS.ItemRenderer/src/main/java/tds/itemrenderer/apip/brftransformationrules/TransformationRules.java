/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip.brftransformationrules;


import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;


/**
 * @author jmambo
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "tag"
})
@XmlRootElement(name = "TransformationRules")
public class TransformationRules {

    @XmlElement(name = "Tag")
    protected List<TransformationRules.Tag> tag;

    /**
     * Gets the value of the tag property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the tag property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getTag().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link TransformationRules.Tag }
     * 
     * 
     */
    public List<TransformationRules.Tag> getTag() {
        if (tag == null) {
            tag = new ArrayList<TransformationRules.Tag>();
        }
        return this.tag;
    }

    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlType(name = "", propOrder = {
        "contextType",
        "tagName",
        "attributes",
        "transformations"
    })
    public static class Tag {

        @XmlElement(name = "ContextType", required = true)
        protected ContextType contextType;
        @XmlElement(name = "TagName", required = true)
        protected String tagName;
        @XmlElement(name = "Attributes")
        protected Attributes attributes;
        @XmlElement(name = "Transformations")
        protected TransformationRules.Tag.Transformations transformations;

        /**
         * Gets the value of the contextType property.
         * 
         * @return
         *     possible object is
         *     {@link ContextType }
         *     
         */
        public ContextType getContextType() {
            return contextType;
        }

        /**
         * Sets the value of the contextType property.
         * 
         * @param value
         *     allowed object is
         *     {@link ContextType }
         *     
         */
        public void setContextType(ContextType value) {
            this.contextType = value;
        }

        /**
         * Gets the value of the tagName property.
         * 
         * @return
         *     possible object is
         *     {@link String }
         *     
         */
        public String getTagName() {
            return tagName;
        }

        /**
         * Sets the value of the tagName property.
         * 
         * @param value
         *     allowed object is
         *     {@link String }
         *     
         */
        public void setTagName(String value) {
            this.tagName = value;
        }

        /**
         * Gets the value of the attributes property.
         * 
         * @return
         *     possible object is
         *     {@link Attributes }
         *     
         */
        public Attributes getAttributes() {
            return attributes;
        }

        /**
         * Sets the value of the attributes property.
         * 
         * @param value
         *     allowed object is
         *     {@link Attributes }
         *     
         */
        public void setAttributes(Attributes value) {
            this.attributes = value;
        }

        /**
         * Gets the value of the transformations property.
         * 
         * @return
         *     possible object is
         *     {@link TransformationRules.Tag.Transformations }
         *     
         */
        public TransformationRules.Tag.Transformations getTransformations() {
            return transformations;
        }

        /**
         * Sets the value of the transformations property.
         * 
         * @param value
         *     allowed object is
         *     {@link TransformationRules.Tag.Transformations }
         *     
         */
        public void setTransformations(TransformationRules.Tag.Transformations value) {
            this.transformations = value;
        }


        @XmlAccessorType(XmlAccessType.FIELD)
        @XmlType(name = "", propOrder = {
            "transform"
        })
        public static class Transformations {

            @XmlElement(name = "Transform")
            protected List<TransformationRules.Tag.Transformations.Transform> transform;

            /**
             * Gets the value of the transform property.
             * 
             * <p>
             * This accessor method returns a reference to the live list,
             * not a snapshot. Therefore any modification you make to the
             * returned list will be present inside the JAXB object.
             * This is why there is not a <CODE>set</CODE> method for the transform property.
             * 
             * <p>
             * For example, to add a new item, do as follows:
             * <pre>
             *    getTransform().add(newItem);
             * </pre>
             * 
             * 
             * <p>
             * Objects of the following type(s) are allowed in the list
             * {@link TransformationRules.Tag.Transformations.Transform }
             * 
             * 
             */
            public List<TransformationRules.Tag.Transformations.Transform> getTransform() {
                if (transform == null) {
                    transform = new ArrayList<TransformationRules.Tag.Transformations.Transform>();
                }
                return this.transform;
            }


 
            @XmlAccessorType(XmlAccessType.FIELD)
            @XmlType(name = "", propOrder = {
                "occurrence",
                "keepchildren",
                "keepchildrenTags",
                "newTag"
            })
            public static class Transform {

                @XmlElement(name = "Occurrence")
                protected BigInteger occurrence;
                @XmlElement(name = "Keepchildren")
                protected KeepChildrenValues keepchildren;
                @XmlElement(name = "KeepchildrenTags")
                protected TransformationRules.Tag.Transformations.Transform.KeepchildrenTags keepchildrenTags;
                @XmlElement(name = "NewTag")
                protected TransformationRules.Tag.Transformations.Transform.NewTag newTag;

                /**
                 * Gets the value of the occurrence property.
                 * 
                 * @return
                 *     possible object is
                 *     {@link BigInteger }
                 *     
                 */
                public BigInteger getOccurrence() {
                    return occurrence;
                }

                /**
                 * Sets the value of the occurrence property.
                 * 
                 * @param value
                 *     allowed object is
                 *     {@link BigInteger }
                 *     
                 */
                public void setOccurrence(BigInteger value) {
                    this.occurrence = value;
                }

                /**
                 * Gets the value of the keepchildren property.
                 * 
                 * @return
                 *     possible object is
                 *     {@link KeepChildrenValues }
                 *     
                 */
                public KeepChildrenValues getKeepchildren() {
                    return keepchildren;
                }

                /**
                 * Sets the value of the keepchildren property.
                 * 
                 * @param value
                 *     allowed object is
                 *     {@link KeepChildrenValues }
                 *     
                 */
                public void setKeepchildren(KeepChildrenValues value) {
                    this.keepchildren = value;
                }

                /**
                 * Gets the value of the keepchildrenTags property.
                 * 
                 * @return
                 *     possible object is
                 *     {@link TransformationRules.Tag.Transformations.Transform.KeepchildrenTags }
                 *     
                 */
                public TransformationRules.Tag.Transformations.Transform.KeepchildrenTags getKeepchildrenTags() {
                    return keepchildrenTags;
                }

                /**
                 * Sets the value of the keepchildrenTags property.
                 * 
                 * @param value
                 *     allowed object is
                 *     {@link TransformationRules.Tag.Transformations.Transform.KeepchildrenTags }
                 *     
                 */
                public void setKeepchildrenTags(TransformationRules.Tag.Transformations.Transform.KeepchildrenTags value) {
                    this.keepchildrenTags = value;
                }

                /**
                 * Gets the value of the newTag property.
                 * 
                 * @return
                 *     possible object is
                 *     {@link TransformationRules.Tag.Transformations.Transform.NewTag }
                 *     
                 */
                public TransformationRules.Tag.Transformations.Transform.NewTag getNewTag() {
                    return newTag;
                }

                /**
                 * Sets the value of the newTag property.
                 * 
                 * @param value
                 *     allowed object is
                 *     {@link TransformationRules.Tag.Transformations.Transform.NewTag }
                 *     
                 */
                public void setNewTag(TransformationRules.Tag.Transformations.Transform.NewTag value) {
                    this.newTag = value;
                }


                @XmlAccessorType(XmlAccessType.FIELD)
                @XmlType(name = "", propOrder = {
                    "keepTagName"
                })
                public static class KeepchildrenTags {

                    @XmlElement(name = "KeepTagName")
                    protected List<String> keepTagName;

                    /**
                     * Gets the value of the keepTagName property.
                     * 
                     * <p>
                     * This accessor method returns a reference to the live list,
                     * not a snapshot. Therefore any modification you make to the
                     * returned list will be present inside the JAXB object.
                     * This is why there is not a <CODE>set</CODE> method for the keepTagName property.
                     * 
                     * <p>
                     * For example, to add a new item, do as follows:
                     * <pre>
                     *    getKeepTagName().add(newItem);
                     * </pre>
                     * 
                     * 
                     * <p>
                     * Objects of the following type(s) are allowed in the list
                     * {@link String }
                     * 
                     * 
                     */
                    public List<String> getKeepTagName() {
                        if (keepTagName == null) {
                            keepTagName = new ArrayList<String>();
                        }
                        return this.keepTagName;
                    }

                }


                @XmlAccessorType(XmlAccessType.FIELD)
                @XmlType(name = "", propOrder = {
                    "tagName",
                    "attributes"
                })
                public static class NewTag {

                    @XmlElement(name = "TagName", required = true)
                    protected String tagName;
                    @XmlElement(name = "Attributes")
                    protected Attributes attributes;

                    /**
                     * Gets the value of the tagName property.
                     * 
                     * @return
                     *     possible object is
                     *     {@link String }
                     *     
                     */
                    public String getTagName() {
                        return tagName;
                    }

                    /**
                     * Sets the value of the tagName property.
                     * 
                     * @param value
                     *     allowed object is
                     *     {@link String }
                     *     
                     */
                    public void setTagName(String value) {
                        this.tagName = value;
                    }

                    /**
                     * Gets the value of the attributes property.
                     * 
                     * @return
                     *     possible object is
                     *     {@link Attributes }
                     *     
                     */
                    public Attributes getAttributes() {
                        return attributes;
                    }

                    /**
                     * Sets the value of the attributes property.
                     * 
                     * @param value
                     *     allowed object is
                     *     {@link Attributes }
                     *     
                     */
                    public void setAttributes(Attributes value) {
                        this.attributes = value;
                    }

                }

            }

        }

    }

}
