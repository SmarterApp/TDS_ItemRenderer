/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.web;

public class JsonString
{
  public static String Enquote (String s) {
    if (s == null)
      return "null";
    if (s.length () == 0)
      return "\"\"";

    return enquote (s, null).toString ();
  }

  public static StringBuilder enquote (String s, StringBuilder sb) {
    int length = Mask.nullString (s).length ();

    if (sb == null)
      sb = new StringBuilder (length + 4);

    sb.append ('"');

    char last;
    char ch = '\0';

    for (int index = 0; index < length; index++) {
      last = ch;
      ch = s.charAt (index);

      switch (ch) {
      case '\\':
      case '"': {
        sb.append ('\\');
        sb.append (ch);
        break;
      }

      case '/': {
        if (last == '<')
          sb.append ('\\');
        sb.append (ch);
        break;
      }

      case '\b':
        sb.append ("\\b");
        break;
      case '\t':
        sb.append ("\\t");
        break;
      case '\n':
        sb.append ("\\n");
        break;
      case '\f':
        sb.append ("\\f");
        break;
      case '\r':
        sb.append ("\\r");
        break;

      default: {
        if (ch < ' ') {
          sb.append ("\\u");
          // TODO Shiva: what is the corresponding this in Java?
          // sb.append (((int) ch).toString ("x4",
          // CultureInfo.InvariantCulture));
          sb.append ("" + ((int) ch));
        } else {
          sb.append (ch);
        }

        break;
      }
      }
    }

    return sb.append ('"');
  }
}
