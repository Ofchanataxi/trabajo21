export const obtainData = (dataToSend: any) => {
  const adaptiveCard = {
    type: 'AdaptiveCard',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: 'Notificacion de Liberacion de RunBES:',
        weight: 'Bolder',
        size: 'Large',
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Nombre del Pozo:', value: dataToSend.nameWell },
          {
            title: 'Fecha y Hora de Actualización:',
            value: dataToSend.updateDate,
          },
          { title: 'Por el usuario:', value: dataToSend.user },
        ],
      },
    ],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
  };

  const bodyReleaseChangeState = {
    body: {
      contentType: 'html',
      content:
        'FP2P te informa<br>Actualización de información del pozo<br>Por favor revisa los detalles y asegúrate de que este todo en órden<br><attachment id="1"></attachment>', // Marcador agregado
    },
    attachments: [
      {
        id: '1', // ID único obligatorio que coincide con el marcador
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: JSON.stringify(adaptiveCard), // Convierte el objeto a JSON string
      },
    ],
  };
  return bodyReleaseChangeState;
};
