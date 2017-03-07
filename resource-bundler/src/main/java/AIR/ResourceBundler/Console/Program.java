/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package AIR.ResourceBundler.Console;

import java.io.IOException;
import java.nio.file.Paths;

import org.jdom2.JDOMException;

import AIR.ResourceBundler.Xml.Resources;
import AIR.ResourceBundler.Xml.ResourcesException;

/*
 * using System; using System.IO; using System.Linq; using
 * AIR.ResourceBundler.Xml;
 */

class Program
{
  private static String _parentFolder;

  public static void main (String[] args) throws JDOMException, IOException,
      ResourcesException {

    if (args.length == 0) {
      System.out.print ("Must provide a xml resource manifest file as a parameter.");
      System.exit (1);
    }

    String xmlFile = args[0];

    // get resources

    // _parentFolder =
    // Paths.get(args[0]).getParent().toString();//Directory.GetParent(args[0]).FullName;
    _parentFolder = Paths.get (xmlFile).getParent ().toString ();// Directory.GetParent(args[0]).FullName;

    // parse config file
    Resources resources = new Resources (xmlFile, null);
    resources.parse ();
    // build combined files
    ResourcesBuilder resourcesBuilder = new ResourcesBuilder (_parentFolder, resources);
    try {
      resourcesBuilder.build ();
    } catch (Exception e) {
      String msg = e.getMessage ();
      e.printStackTrace ();
    }
    System.out.print ("");
  }
  /*
   * static void UnhandledExceptionTrapper(Object sender,
   * UnhandledExceptionEventArgs ue) { // log error Exception exception =
   * (Exception)ue.ExceptionObject;
   * 
   * // write out error System.Console.ForegroundColor = ConsoleColor.Red;
   * System.Console.WriteLine("Unhandled Exception: " + exception);
   * System.Console.ResetColor();
   * 
   * Environment.Exit(-1); }
   */
}
