<?php
namespace AppBundle\Controller;

use PhpOffice\PhpWord\TemplateProcessor;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Serializer\Encoder\JsonEncoder;

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
        $ls = $this->getParameter('templates_dir') . $id . '.docx';

        $template = new TemplateProcessor($this->getParameter('templates_dir') . $id . '.docx');
        $template->setValue('test', 'myvalue');
        $template->saveAs($this->getParameter('temp_dir') . $id . '_' . microtime() * rand() . '.docx');

        return $this->render('document/view.html.twig', array('page_title' => "Перегляд документу", 'document' => $document, 'elements' => $elements, 'debug' => $ls));
    }

    /**
     * @Route("/view/generated/{id}.jpg", name="generate_jpg", requirements={"id": "\d+"})
     */
    public function generateJpg($id) {
        $request = Request::createFromGlobals();
        $generatedDocx = $this->formDocument($id, $request);
        $response = $this->convertToJPG($this->getParameter('temp_dir') . $generatedDocx . '.docx');

        return new BinaryFileResponse($this->getParameter('temp_dir') . $generatedDocx . '.jpg');
    }

    private function formDocument($id, $request) {
        $template = new TemplateProcessor($this->getParameter('templates_dir') . $id . '.docx');
        foreach ($request->request as $param => $value) {
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

}