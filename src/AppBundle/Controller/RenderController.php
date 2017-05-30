<?php
namespace AppBundle\Controller;

use PhpOffice\PhpWord\TemplateProcessor;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class RenderController extends Controller
{
    /**
     * @Route("/view/{id}", name="view_document", requirements={"id": "\d+"})
     */
    public function viewAction($id) {

        $document = $this->getDoctrine()->getRepository('AppBundle:Document')->find($id);
        $jsonEncoder = new JsonEncoder();
        $elements = $jsonEncoder->decode($document->getJson(), 'json');

        return $this->render('document/view.html.twig', array(
            'page_title' => "Перегляд документу",
            'document' => $document,
            'elements' => $elements,
            'templateUploaded' => $document->isTemplateUploaded($this->getParameter('templates_dir'))
            ));
    }

    /**
     * @Route("/view/template/{id}", name="get_template", requirements={"id": "\d+"})
     */
    public function getTemplateAction($id) {
        $document = $this->getDoctrine()->getRepository('AppBundle:Document')->find($id);
        $response = new BinaryFileResponse($this->getParameter('templates_dir') . $id . '.docx');
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $document->getName() . '.docx');
        return $response;
    }

    /**
     * @Route("/view/generated/{id}.jpg", name="generate_jpg", requirements={"id": "\d+"})
     */
    public function generateJpgAction($id) {
        $request = Request::createFromGlobals();
        $generatedDocx = $this->formDocument($id, $request->request->get('document'));
        $response = $this->convertToJPG($this->getParameter('temp_dir') . $generatedDocx . '.docx');

        return new BinaryFileResponse($this->getParameter('temp_dir') . $generatedDocx . '.jpg');
    }

    /**
     * @Route("/view/generated/{id}.pdf", name="generate_pdf", requirements={"id": "\d+"})
     */
    public function generatePdfAction($id) {
        $request = Request::createFromGlobals();
        $generatedDocx = $this->formDocument($id, $request->request->get('document'));
        $this->convertToPDF($this->getParameter('temp_dir') . $generatedDocx . '.docx');

        $response = new BinaryFileResponse($this->getParameter('temp_dir') . $generatedDocx . '.pdf');
        $response->headers->set('Content-Disposition', 'filename="filetodownload.pdf"');
        return $response;
    }

    private function formDocument($id, $request) {
        $template = new TemplateProcessor($this->getParameter('templates_dir') . $id . '.docx');
        if (!empty($request))
            foreach ($request as $param => $value) {
                $template->setValue($param, $value);
            }
        $temp_dir = $this->getParameter('temp_dir');
        $fileName = $id . '_' . microtime() * rand();
        $template->saveAs($temp_dir . $fileName . '.docx');
        return $fileName;
    }

    private function convertToJPG ($file) {
        return shell_exec('export HOME=/tmp && libreoffice --headless --convert-to jpg --outdir ' . $this->getParameter('temp_dir') . ' ' . $file);
    }

    private function convertToPDF ($file) {
        return shell_exec('export HOME=/tmp && libreoffice --headless --convert-to pdf --outdir ' . $this->getParameter('temp_dir') . ' ' . $file);
    }

}