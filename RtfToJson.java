import java.io.FileInputStream;
import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import javax.swing.text.BadLocationException;
import javax.swing.text.Document;
import javax.swing.text.rtf.RTFEditorKit;
import java.io.PrintStream;

public class RtfToJson {
    public static void main(String[] args) throws IOException, BadLocationException {
        if (args.length != 1) {
            System.err.println("Uso: java RtfToJson <caminho_arquivo_rtf>");
            System.exit(1);
        }

        System.setOut(new PrintStream(System.out, true, "UTF-8"));

        // Load the RTF content
        RTFEditorKit rtf = new RTFEditorKit();
        Document doc = rtf.createDefaultDocument();

        String rtfFilePath = args[0];
        FileInputStream fis = new FileInputStream(rtfFilePath);
        InputStreamReader i = new InputStreamReader(fis, "UTF-8"); // Use UTF-8 encoding
        rtf.read(i, doc, 0);

        // Get the plain text content
        String doc1 = doc.getText(0, doc.getLength());

        // Write the plain text to the standard output with UTF-8 encoding
        try {
            BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(new FileOutputStream("temp\\Data.txt"), "UTF-8")
            );

            writer.write(doc1);
            writer.close();
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}