<?php

namespace AppBundle\Controller;
use AppBundle\Entity\Document;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class EditController extends Controller {

    /**
     * @Route("/edit/{id}", name="edit_document", requirements={"id": "\d+"})
     */
    public function editAction($id) {
        $document = $this->getDoctrine()->getRepository('AppBundle:Document')->find($id);
        return $this->render('document/edit.html.twig', array('page_title' => "Редагування документу", 'document' => $document));
    }

    /**
     * @Route("/edit/new/", name="new_document")
     */
    public function newAction() {
        $document = new Document();
        return $this->render('document/edit.html.twig', array('page_title' => "Новий документ", 'document' => $document));
    }

    /**
     * @Route("/edit/remove/{id}", name="remove_document", requirements={"id": "\d+"})
     */
    public function removeAction($id) {
        $manager = $this->getDoctrine()->getManager();
        $document = $manager->getRepository('AppBundle:Document')->find($id);

        if (!$document) {
            throw $this->createNotFoundException(
                'No document found for id '.$id
            );
        } else {
            $manager->remove($document);
            $manager->flush();
        }

        return $this->redirectToRoute('homepage');
    }

    /**
     * @Route("/edit/save/", name="save_new_document")
     * @Route("/edit/save/{id}", name="save_document", requirements={"id": "\d+"})
     */
    public function saveAction($id = '') {

        $request = Request::createFromGlobals();

        $manager = $this->getDoctrine()->getManager();

        if (!empty($id)) {
            $document = $manager->getRepository('AppBundle:Document')->find($id);

            if (!$document) {
                throw $this->createNotFoundException(
                    'No document found for id '.$id
                );
            }
        } else {
            $document = new Document();
        }

        $document->setName($request->request->get('document-name'));
        $document->setAutomatization($request->request->get('document-automatization'));
        $document->setDate($request->request->get('document-date'));
        $document->setVersion($request->request->get('document-version'));
        $document->setJson($request->request->get('document-json'));

        if(empty($id))
            $manager->persist($document);

        $manager->flush();

        return $this->redirectToRoute('homepage');
    }
}

?>