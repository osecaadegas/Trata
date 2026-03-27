const blogArticles = [
  {
    slug: 'como-comprar-casa-em-portugal',
    title: 'Como Comprar Casa em Portugal Passo a Passo',
    description: 'Guia completo com todos os passos para comprar casa em Portugal, desde a pesquisa até à escritura.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    date: '2026-03-15',
    readTime: '8 min',
    category: 'Guia de Compra',
    content: [
      {
        type: 'paragraph',
        text: 'Comprar casa é uma das decisões mais importantes da vida. Se está a pensar adquirir um imóvel em Portugal, este guia vai ajudá-lo a percorrer cada etapa com confiança, desde a pesquisa inicial até ao momento em que recebe as chaves.'
      },
      {
        type: 'heading',
        text: '1. Defina o Seu Orçamento'
      },
      {
        type: 'paragraph',
        text: 'Antes de começar a procurar casa, é fundamental saber quanto pode gastar. Analise as suas poupanças, rendimentos mensais e despesas fixas. Lembre-se que, além do preço do imóvel, existem custos adicionais como IMT (Imposto Municipal sobre Transmissões), Imposto de Selo, escritura e registos.'
      },
      {
        type: 'paragraph',
        text: 'A regra geral é que a prestação mensal do crédito habitação não deve ultrapassar 30% a 35% do rendimento líquido do agregado familiar. A maioria dos bancos financia até 90% do valor de avaliação do imóvel para habitação própria permanente.'
      },
      {
        type: 'heading',
        text: '2. Obtenha Pré-Aprovação do Crédito Habitação'
      },
      {
        type: 'paragraph',
        text: 'Contacte vários bancos para obter simulações de crédito habitação. Compare as taxas de juro (fixa, variável ou mista), spreads, seguros obrigatórios e comissões. A pré-aprovação dá-lhe uma ideia clara do montante que pode pedir emprestado e demonstra aos vendedores que é um comprador sério.'
      },
      {
        type: 'tip',
        text: 'Dica: Peça simulações a pelo menos 3 bancos diferentes. A diferença no spread pode poupar-lhe milhares de euros ao longo do empréstimo.'
      },
      {
        type: 'heading',
        text: '3. Pesquise o Mercado e Escolha a Zona'
      },
      {
        type: 'paragraph',
        text: 'Defina os seus critérios: tipologia, zona, proximidade a transportes, escolas, serviços e espaços verdes. Analise os preços praticados na zona que lhe interessa consultando portais imobiliários e falando com agentes locais.'
      },
      {
        type: 'paragraph',
        text: 'Considere não só o preço atual mas também o potencial de valorização da zona. Áreas com novos projetos de infraestruturas, transportes ou requalificação urbana tendem a valorizar mais rapidamente.'
      },
      {
        type: 'heading',
        text: '4. Visite os Imóveis'
      },
      {
        type: 'paragraph',
        text: 'Visite sempre os imóveis pessoalmente, de preferência em diferentes horas do dia. Esteja atento a: estado de conservação, humidade, isolamento térmico e acústico, orientação solar, estacionamento e estado das áreas comuns (no caso de apartamentos).'
      },
      {
        type: 'paragraph',
        text: 'Não hesite em fazer perguntas sobre obras recentes, encargos de condomínio, certificação energética e documentação do imóvel. Um bom agente imobiliário poderá ajudá-lo a avaliar todos estes aspetos.'
      },
      {
        type: 'heading',
        text: '5. Faça uma Proposta'
      },
      {
        type: 'paragraph',
        text: 'Quando encontrar o imóvel ideal, é hora de fazer uma proposta. Esta pode ser verbal num primeiro momento, mas deve ser formalizada por escrito. A proposta deve incluir o valor oferecido, condições de pagamento e prazos pretendidos.'
      },
      {
        type: 'heading',
        text: '6. Contrato-Promessa de Compra e Venda (CPCV)'
      },
      {
        type: 'paragraph',
        text: 'Após acordo entre as partes, assina-se o CPCV. Este documento vincula comprador e vendedor e define todas as condições da transação. Normalmente é pago um sinal entre 10% a 20% do valor do imóvel.'
      },
      {
        type: 'paragraph',
        text: 'Antes de assinar o CPCV, é essencial verificar: a caderneta predial, certidão de registo predial, licença de utilização, certificado energético e inexistência de ónus ou encargos sobre o imóvel.'
      },
      {
        type: 'tip',
        text: 'Recomendamos que tenha o apoio de um advogado ou solicitador para rever o CPCV antes de assinar.'
      },
      {
        type: 'heading',
        text: '7. Finalize o Crédito Habitação'
      },
      {
        type: 'paragraph',
        text: 'Com o CPCV assinado, apresente-o ao banco para formalizar o crédito. O banco irá realizar a avaliação do imóvel e, se tudo estiver conforme, emitirá a aprovação final. Este processo pode demorar 2 a 4 semanas.'
      },
      {
        type: 'heading',
        text: '8. Escritura Pública'
      },
      {
        type: 'paragraph',
        text: 'A escritura é o ato formal de transmissão da propriedade. Pode ser realizada num cartório notarial, conservatória ou online através do Casa Pronta. No dia da escritura, são pagos os impostos (IMT e Imposto de Selo) e o valor remanescente do imóvel.'
      },
      {
        type: 'paragraph',
        text: 'Após a escritura, o imóvel é oficialmente seu! Restam alguns passos administrativos como a atualização dos contratos de serviços (água, eletricidade, gás), registo nas Finanças e, se aplicável, comunicação ao condomínio.'
      },
      {
        type: 'heading',
        text: 'Conclusão'
      },
      {
        type: 'paragraph',
        text: 'Comprar casa em Portugal é um processo que requer planeamento e atenção, mas com a orientação certa torna-se muito mais simples. Na TRATA Imobiliária, acompanhamos os nossos clientes em todas as etapas, garantindo uma experiência tranquila e segura.'
      }
    ]
  },
  {
    slug: 'melhores-zonas-para-viver-em-portugal',
    title: 'Melhores Zonas para Viver em Portugal',
    description: 'Descubra as melhores cidades e regiões de Portugal para viver, com análise de qualidade de vida, preços e acessibilidades.',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    date: '2026-03-10',
    readTime: '10 min',
    category: 'Lifestyle',
    content: [
      {
        type: 'paragraph',
        text: 'Portugal oferece uma qualidade de vida invejável, com clima ameno, gastronomia rica, segurança e um custo de vida competitivo face a outros países europeus. Mas qual é a melhor zona para viver? A resposta depende do seu estilo de vida, orçamento e prioridades.'
      },
      {
        type: 'heading',
        text: 'Braga — Tradição e Dinamismo'
      },
      {
        type: 'paragraph',
        text: 'Braga é uma das cidades que mais cresce em Portugal. Com uma universidade de referência, um centro histórico encantador e uma economia em expansão, oferece excelente qualidade de vida a preços mais acessíveis do que Lisboa ou Porto.'
      },
      {
        type: 'paragraph',
        text: 'O mercado imobiliário em Braga tem mostrado uma valorização consistente, com preços médios por metro quadrado significativamente abaixo das grandes cidades. A cidade destaca-se pela sua oferta cultural, gastronómica e pela proximidade ao Parque Nacional da Peneda-Gerês.'
      },
      {
        type: 'tip',
        text: 'Maximinos, São Vicente, Nogueira e Real são algumas das freguesias mais procuradas para viver em Braga, oferecendo boa relação qualidade-preço.'
      },
      {
        type: 'heading',
        text: 'Lisboa — A Capital Cosmopolita'
      },
      {
        type: 'paragraph',
        text: 'Lisboa é o centro económico e cultural de Portugal. Oferece uma vasta oferta de emprego, transportes públicos abrangentes, vida noturna vibrante e uma cena gastronómica de classe mundial. No entanto, os preços do imobiliário são os mais elevados do país.'
      },
      {
        type: 'paragraph',
        text: 'Para quem procura alternativas mais acessíveis sem abdicar da proximidade a Lisboa, zonas como Almada, Amadora, Sintra, Oeiras e Cascais oferecem um bom equilíbrio entre preço e qualidade de vida, com excelentes ligações de transportes à capital.'
      },
      {
        type: 'heading',
        text: 'Porto — Charme e Autenticidade'
      },
      {
        type: 'paragraph',
        text: 'O Porto tem vivido uma verdadeira revolução nos últimos anos. A cidade Invicta combina a autenticidade das suas tradições com uma energia criativa e empreendedora crescente. O mercado imobiliário valorizou significativamente, mas ainda oferece opções mais acessíveis do que Lisboa.'
      },
      {
        type: 'paragraph',
        text: 'Matosinhos, Vila Nova de Gaia, Maia e Gondomar são concelhos limítrofes com excelente qualidade de vida e preços mais moderados, mantendo fácil acesso ao centro do Porto.'
      },
      {
        type: 'heading',
        text: 'Algarve — Sol e Qualidade de Vida'
      },
      {
        type: 'paragraph',
        text: 'O Algarve é a região mais ensolarada de Portugal continental, com mais de 300 dias de sol por ano. Ideal para quem valoriza a proximidade à praia e um ritmo de vida mais tranquilo. Faro, Loulé, Lagos e Tavira são algumas das cidades mais procuradas.'
      },
      {
        type: 'paragraph',
        text: 'O custo de vida no Algarve é geralmente mais baixo do que em Lisboa, embora os preços do imobiliário na zona costeira possam ser elevados, especialmente nas áreas mais turísticas. O interior algarvio oferece alternativas muito mais acessíveis.'
      },
      {
        type: 'heading',
        text: 'Coimbra — A Cidade Universitária'
      },
      {
        type: 'paragraph',
        text: 'Coimbra é conhecida pela sua universidade centenária, a mais antiga de Portugal. A cidade oferece um ambiente académico estimulante, rica vida cultural e custos de vida bastante acessíveis. O mercado imobiliário apresenta algumas das melhores oportunidades do país.'
      },
      {
        type: 'heading',
        text: 'Aveiro — A Veneza de Portugal'
      },
      {
        type: 'paragraph',
        text: 'Aveiro tem ganho destaque como uma das cidades com melhor qualidade de vida em Portugal. Os seus canais, a universidade e a crescente indústria tecnológica fazem dela uma opção atrativa para jovens profissionais e famílias. Os preços do imobiliário são muito competitivos.'
      },
      {
        type: 'heading',
        text: 'Ilhas — Açores e Madeira'
      },
      {
        type: 'paragraph',
        text: 'Para quem procura um estilo de vida mais conectado com a natureza, os Açores e a Madeira são destinos extraordinários. Ponta Delgada nos Açores e o Funchal na Madeira oferecem todos os serviços essenciais com a vantagem de paisagens deslumbrantes e um ritmo de vida único.'
      },
      {
        type: 'heading',
        text: 'Como Escolher a Zona Certa?'
      },
      {
        type: 'paragraph',
        text: 'A escolha da zona ideal depende de fatores como: proximidade ao trabalho, acessibilidade a transportes, oferta de escolas e serviços de saúde, segurança, vida cultural e social, e, naturalmente, o orçamento disponível.'
      },
      {
        type: 'paragraph',
        text: 'Na TRATA Imobiliária, ajudamos os nossos clientes a encontrar o imóvel perfeito na zona que melhor se adapta ao seu estilo de vida. Contacte-nos para uma consultoria personalizada.'
      }
    ]
  },
  {
    slug: 'custos-de-comprar-casa-2026',
    title: 'Custos de Comprar Casa em 2026',
    description: 'Saiba todos os custos envolvidos na compra de um imóvel em Portugal em 2026: impostos, taxas, seguros e mais.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    date: '2026-03-01',
    readTime: '7 min',
    category: 'Finanças',
    content: [
      {
        type: 'paragraph',
        text: 'Comprar casa envolve bastante mais do que o preço anunciado. Existem impostos, taxas e despesas que podem representar entre 5% a 10% do valor do imóvel. Neste guia, detalhamos todos os custos que deve considerar em 2026.'
      },
      {
        type: 'heading',
        text: 'IMT — Imposto Municipal sobre Transmissões'
      },
      {
        type: 'paragraph',
        text: 'O IMT é o imposto mais significativo na compra de um imóvel. As taxas variam consoante o valor do imóvel, a sua localização (continente ou ilhas) e a finalidade (habitação própria permanente, secundária ou outros fins).'
      },
      {
        type: 'paragraph',
        text: 'Para habitação própria permanente em Portugal continental, os escalões de IMT em 2026 são progressivos, variando entre 0% (para imóveis até ao limite de isenção) e 7,5% para os escalões mais elevados. Imóveis com valor tributário até determinados limites estão isentos de IMT para jovens até 35 anos na compra da primeira habitação.'
      },
      {
        type: 'tip',
        text: 'Exemplo: Para um imóvel de 200.000€ para habitação própria permanente, o IMT ronda os 2.400€ a 4.000€, dependendo da aplicação dos escalões.'
      },
      {
        type: 'heading',
        text: 'Imposto de Selo'
      },
      {
        type: 'paragraph',
        text: 'O Imposto de Selo sobre a compra do imóvel corresponde a 0,8% sobre o valor da escritura ou sobre o Valor Patrimonial Tributário (VPT), prevalecendo o valor mais elevado. Se recorrer a crédito habitação, paga ainda 0,6% sobre o valor do empréstimo.'
      },
      {
        type: 'heading',
        text: 'Comissão da Imobiliária'
      },
      {
        type: 'paragraph',
        text: 'Em Portugal, a comissão da agência imobiliária é tipicamente paga pelo vendedor. No entanto, é importante confirmar este aspeto desde o início. As comissões variam geralmente entre 3% a 5% do valor de venda, com IVA incluído.'
      },
      {
        type: 'heading',
        text: 'Custos com Crédito Habitação'
      },
      {
        type: 'paragraph',
        text: 'Se recorrer a financiamento bancário, deve contar com os seguintes custos:'
      },
      {
        type: 'list',
        items: [
          'Comissão de avaliação do imóvel: 150€ a 350€',
          'Comissão de dossier/estudo: 200€ a 500€',
          'Seguro de vida associado ao crédito: variável conforme idade e capital',
          'Seguro multirriscos do imóvel: obrigatório, variável conforme o imóvel',
          'Imposto de Selo sobre o empréstimo: 0,6% do valor financiado'
        ]
      },
      {
        type: 'heading',
        text: 'Escritura e Registo'
      },
      {
        type: 'paragraph',
        text: 'Os custos notariais e de registo incluem:'
      },
      {
        type: 'list',
        items: [
          'Escritura em cartório notarial: 400€ a 700€',
          'Casa Pronta (serviço simplificado): cerca de 375€',
          'Registo na Conservatória: 250€ a 400€',
          'Certidões e documentos: 50€ a 100€'
        ]
      },
      {
        type: 'heading',
        text: 'Custos Recorrentes Após a Compra'
      },
      {
        type: 'paragraph',
        text: 'Após a compra, deve considerar os seguintes custos anuais e mensais:'
      },
      {
        type: 'list',
        items: [
          'IMI (Imposto Municipal sobre Imóveis): entre 0,3% e 0,45% do VPT por ano',
          'Condomínio (em apartamentos): variável, geralmente 30€ a 150€/mês',
          'Seguros obrigatórios: renovação anual',
          'Manutenção e reparações: reservar 1% a 2% do valor do imóvel por ano'
        ]
      },
      {
        type: 'heading',
        text: 'Isenções e Benefícios Fiscais em 2026'
      },
      {
        type: 'paragraph',
        text: 'Em 2026, existem algumas isenções importantes a considerar: isenção ou redução de IMT para jovens até 35 anos na primeira habitação, isenção temporária de IMI para imóveis de habitação própria permanente (até 3 anos) e benefícios para reabilitação de imóveis em zonas de reabilitação urbana.'
      },
      {
        type: 'tip',
        text: 'Consulte sempre um contabilista ou advogado para confirmar a sua elegibilidade para isenções fiscais, pois as condições podem variar.'
      },
      {
        type: 'heading',
        text: 'Resumo de Custos — Exemplo Prático'
      },
      {
        type: 'paragraph',
        text: 'Para um imóvel de 200.000€ com crédito habitação de 180.000€ (90% de financiamento):'
      },
      {
        type: 'list',
        items: [
          'Entrada (10%): 20.000€',
          'IMT: ~3.200€',
          'Imposto de Selo (imóvel): 1.600€',
          'Imposto de Selo (crédito): 1.080€',
          'Escritura + Registo (Casa Pronta): ~700€',
          'Comissões bancárias: ~600€',
          'Total aproximado de custos adicionais: ~7.200€',
          'Total necessário: ~27.200€ (entrada + custos)'
        ]
      },
      {
        type: 'heading',
        text: 'Conclusão'
      },
      {
        type: 'paragraph',
        text: 'Planear financeiramente a compra de casa é essencial para evitar surpresas. Na TRATA Imobiliária, ajudamos os nossos clientes a compreender todos os custos envolvidos e a tomar decisões informadas. Contacte-nos para uma orientação personalizada.'
      }
    ]
  }
];

export default blogArticles;
