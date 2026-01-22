-- =====================================================
-- SAMPLE MESSAGES FOR DEMO
-- Run this in Supabase SQL Editor after creating the messages table
-- =====================================================

-- First, add any missing columns
ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject VARCHAR(100);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS property_title VARCHAR(255);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS notes TEXT;

INSERT INTO messages (name, email, phone, subject, message, property_title, status, notes, created_at) VALUES

-- Unread messages (most recent)
(
    'João Silva',
    'joao.silva@email.com',
    '+351 912 345 678',
    'comprar',
    'Olá, estou interessado no apartamento T3 em Braga Centro. Gostaria de agendar uma visita para o próximo fim de semana se possível. Tenho disponibilidade sábado de manhã ou domingo à tarde. Obrigado!',
    'Apartamento T3 Vista Mar',
    'unread',
    NULL,
    NOW() - INTERVAL '2 hours'
),
(
    'Ana Ferreira',
    'ana.ferreira@outlook.com',
    '+351 961 234 567',
    'avaliacao',
    'Bom dia, gostaria de solicitar uma avaliação gratuita do meu apartamento T2 em Guimarães. O imóvel tem cerca de 85m², está em bom estado e fica perto do centro. Quando seria possível agendar?',
    NULL,
    'unread',
    NULL,
    NOW() - INTERVAL '5 hours'
),
(
    'Carlos Mendes',
    'carlos.mendes@gmail.com',
    '+351 923 876 543',
    'interesse',
    'Vi a moradia T4 com jardim no vosso site e estou muito interessado. Podem enviar-me mais fotos e informações sobre a zona? Obrigado.',
    'Moradia T4 com Jardim',
    'unread',
    NULL,
    NOW() - INTERVAL '1 day'
),

-- Read messages
(
    'Maria Santos',
    'maria.santos@gmail.com',
    '+351 923 456 789',
    'vender',
    'Bom dia, gostaria de saber mais informações sobre como vender o meu imóvel através da TRATA. Tenho uma moradia T3 em Braga, zona de Gualtar, com cerca de 180m² e jardim. Qual é o processo e quais são as vossas comissões?',
    NULL,
    'read',
    'Cliente interessado em venda. Agendar chamada para amanhã.',
    NOW() - INTERVAL '2 days'
),
(
    'Ricardo Oliveira',
    'ricardo.oliveira@mail.com',
    '+351 915 678 901',
    'comprar',
    'Boa tarde, vi a moradia V4 em Barcelos e estou muito interessado. Qual é a disponibilidade para uma visita? Também gostaria de saber se há margem de negociação no preço. Aguardo resposta.',
    'Moradia V4 com Jardim',
    'read',
    'Visita agendada para 25/01 às 15h',
    NOW() - INTERVAL '3 days'
),
(
    'Sofia Costa',
    'sofia.costa@empresa.pt',
    '+351 936 789 012',
    'arrendar',
    'Preciso de um apartamento T2 para arrendar na zona de Braga. O meu orçamento é até 750€/mês. Tenho disponibilidade imediata para mudança. Têm alguma opção disponível?',
    NULL,
    'read',
    'Enviada lista de 3 imóveis disponíveis por email',
    NOW() - INTERVAL '4 days'
),

-- Replied messages
(
    'Pedro Almeida',
    'pedro.almeida@email.pt',
    '+351 934 567 890',
    'comprar',
    'Olá, estou à procura de um apartamento T2 ou T3 em Braga, zona centro ou São Vicente. Orçamento máximo de 200.000€. Podem ajudar-me a encontrar algo adequado?',
    NULL,
    'replied',
    'Respondido com lista de 5 imóveis. Cliente vai visitar 2 no sábado.',
    NOW() - INTERVAL '5 days'
),
(
    'Teresa Rodrigues',
    'teresa.rodrigues@gmail.com',
    '+351 912 111 222',
    'avaliacao',
    'Gostaria de saber o valor de mercado do meu apartamento T3 em Maximinos. Tem 120m², está renovado e tem garagem. Podem fazer uma avaliação?',
    NULL,
    'replied',
    'Avaliação realizada: 245.000€ - 260.000€. Cliente vai pensar.',
    NOW() - INTERVAL '1 week'
),
(
    'Bruno Ferreira',
    'bruno.ferreira@mail.com',
    '+351 965 432 109',
    'interesse',
    'Vi o apartamento T1 perto da universidade e parece perfeito para investimento. Qual é a rentabilidade esperada se colocar para arrendar? E qual o estado atual do imóvel?',
    'Apartamento T1 para Investimento',
    'replied',
    'Enviada análise de rentabilidade. Rentabilidade estimada: 5.2% bruta.',
    NOW() - INTERVAL '1 week'
),

-- Archived messages
(
    'Empresa Construções Lda',
    'geral@construcoeslda.pt',
    '+351 253 123 456',
    'parceria',
    'Somos uma empresa de construção civil e gostaríamos de explorar possíveis parcerias com a TRATA para comercialização de novos empreendimentos na zona de Braga.',
    NULL,
    'archived',
    'Parceria não se enquadra no perfil atual. Contactar no futuro.',
    NOW() - INTERVAL '2 weeks'
),
(
    'Miguel Sousa',
    'miguel.sousa@email.com',
    '+351 918 765 432',
    'outro',
    'Gostaria de saber se têm estágios ou oportunidades de emprego na área comercial. Tenho experiência em vendas e interesse no mercado imobiliário.',
    NULL,
    'archived',
    'Candidatura guardada para futuras oportunidades.',
    NOW() - INTERVAL '3 weeks'
);

-- Verify inserted messages
SELECT 
    status,
    COUNT(*) as count
FROM messages 
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'unread' THEN 1 
        WHEN 'read' THEN 2 
        WHEN 'replied' THEN 3 
        WHEN 'archived' THEN 4 
    END;
