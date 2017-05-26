<?php
namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\Serializer\Encoder\JsonEncoder;

class RenderController extends Controller
{
    /**
     * @Route("/view/{id}", name="view_document", requirements={"id": "\d+"})
     */
    public function viewAction($id) {
        $document = $this->getDoctrine()->getRepository('AppBundle:Document')->find($id);
        $jsonEncoder = new JsonEncoder();
        $elements = $jsonEncoder->decode($document->getJson(), 'json');
        return $this->render('document/view.html.twig', array('page_title' => "Перегляд документу", 'document' => $document, 'elements' => $elements));
    }
}