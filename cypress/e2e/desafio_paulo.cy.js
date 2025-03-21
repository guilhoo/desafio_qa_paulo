// cypress/e2e/login.cy.js
describe("Teste de login", () => {
  // Teste 1: Login válido + Logout
  it('Deve fazer login e logout com sucesso', () => {
    cy.visit('https://www.saucedemo.com/')
    
    // Login válido
    cy.get('[data-test="username"]').type('standard_user')
    cy.get('[data-test="password"]').type('secret_sauce')
    cy.get('[data-test="login-button"]').click()
    cy.url().should('include', '/inventory.html')

    // Logout
    cy.get("#react-burger-menu-btn").click()
    cy.get("#logout_sidebar_link").should('be.visible')
    cy.get("#logout_sidebar_link").click()
    
    // Verificação pós-logout
    cy.url().should('eq', 'https://www.saucedemo.com/')
    cy.get('[data-test="login-button"]').should('exist')
  })

  // Teste 2: Credenciais inválidas
  it('Deve exibir erro ao usar credenciais inválidas', () => {
    cy.visit('https://www.saucedemo.com/')
    
    cy.get('[data-test="username"]').type('usuario_invalido')
    cy.get('[data-test="password"]').type('senha_errada')
    cy.get('[data-test="login-button"]').click()

    cy.get('[data-test="error"]')
      .should('be.visible')
      .and('contain', 'Username and password do not match any user in this service')
  })
})

describe('Teste do Carrinho', () => {
  beforeEach(() => {
    // Executa o login antes de cada teste do carrinho
    cy.visit('https://www.saucedemo.com/')
    cy.get('[data-test="username"]').type('standard_user')
    cy.get('[data-test="password"]').type('secret_sauce')
    cy.get('[data-test="login-button"]').click()
    cy.url().should('include', '/inventory.html')
  })

  it('Deve adicionar um item ao carrinho e validar', () => {
    // Adiciona a mochila ao carrinho
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()

    // Verifica o badge do carrinho
    cy.get('.shopping_cart_badge').should('contain', '1')

    // Acessa o carrinho
    cy.get('.shopping_cart_link').click()
    cy.url().should('include', '/cart.html')

    // Valida itens no carrinho
    cy.get('.cart_item')
      .should('have.length', 1)
      .and('contain', 'Sauce Labs Backpack')
      .and('contain', '$29.99')
  })

  it('Deve adicionar múltiplos itens ao carrinho', () => {
    // Adiciona 2 itens
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
    cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click()

    // Verifica quantidade total
    cy.get('.shopping_cart_badge').should('contain', '2')

    // Valida lista completa
    cy.get('.shopping_cart_link').click()
    cy.get('.cart_item')
      .should('have.length', 2)
      .then(($items) => {
        expect($items.eq(0)).to.contain('Sauce Labs Backpack')
        expect($items.eq(1)).to.contain('Sauce Labs Bike Light')
      })
  })
})

describe('Teste de Checkout', () => {
  beforeEach(() => {
    // Login e adição de itens ao carrinho
    cy.visit('https://www.saucedemo.com/')
    cy.get('[data-test="username"]').type('standard_user')
    cy.get('[data-test="password"]').type('secret_sauce')
    cy.get('[data-test="login-button"]').click()
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
    cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click()
  })

  it('Deve finalizar a compra com sucesso', () => {
    // Acessa o carrinho
    cy.get('.shopping_cart_link').click()
    cy.url().should('include', '/cart.html')

    // Inicia checkout
    cy.get('[data-test="checkout"]').click()

    // Preenche informações do usuário
    cy.get('[data-test="firstName"]').type('Paulo')
    cy.get('[data-test="lastName"]').type('Silva')
    cy.get('[data-test="postalCode"]').type('12345678')
    cy.get('[data-test="continue"]').click()

    // Finaliza a compra
    cy.get('[data-test="finish"]').click()

    // Verifica mensagem de confirmação
    cy.get('.complete-header')
      .should('be.visible')
      .and('have.text', 'Thank you for your order!')
  })
})

describe('Teste de Navegação em Produtos', () => {
  beforeEach(() => {
    // Login e navegação para a página de produtos
    cy.visit('https://www.saucedemo.com/')
    cy.get('[data-test="username"]').type('standard_user')
    cy.get('[data-test="password"]').type('secret_sauce')
    cy.get('[data-test="login-button"]').click()
    cy.url().should('include', '/inventory.html')
  })

  it('Deve abrir a página de um produto e adicioná-lo ao carrinho', () => {
    // Acessa a página do primeiro produto (Sauce Labs Backpack)
    cy.get('#item_4_title_link').click()
    cy.url().should('include', '/inventory-item.html?id=4')

    // Valida detalhes do produto
    cy.get('.inventory_details_name').should('contain', 'Sauce Labs Backpack')
    cy.get('.inventory_details_price').should('contain', '$29.99')

    // Adiciona ao carrinho
    cy.get('[data-test="add-to-cart"]').click()
    cy.get('.shopping_cart_badge').should('contain', '1')
  })

  it('Deve adicionar múltiplos produtos de suas páginas individuais', () => {
    // Produto 1: Sauce Labs Bike Light
    cy.get('#item_0_title_link').click()
    cy.url().should('include', '/inventory-item.html?id=0')
    cy.get('[data-test="add-to-cart"]').click()
    cy.go('back') // Volta para a lista de produtos

    // Produto 2: Sauce Labs Bolt T-Shirt
    cy.get('#item_1_title_link').click()
    cy.url().should('include', '/inventory-item.html?id=1')
    cy.get('[data-test="add-to-cart"]').click()

    // Verifica total no carrinho
    cy.get('.shopping_cart_badge').should('contain', '2')
  })
})

describe('Teste de Adição/Remoção em Massa', () => {
  beforeEach(() => {
    // Login e navegação para a página de produtos
    cy.visit('https://www.saucedemo.com/')
    cy.get('[data-test="username"]').type('standard_user')
    cy.get('[data-test="password"]').type('secret_sauce')
    cy.get('[data-test="login-button"]').click()
    cy.url().should('include', '/inventory.html')
  })

  it('Deve adicionar e remover todos os itens do carrinho', () => {
    // Adiciona TODOS os itens ao carrinho
    cy.get('[data-test^="add-to-cart"]').each(($button) => {
      cy.wrap($button).click()
    })

    // Verifica quantidade total (6 itens no total no site)
    cy.get('.shopping_cart_badge').should('contain', '6')

    // Acessa o carrinho
    cy.get('.shopping_cart_link').click()
    cy.url().should('include', '/cart.html')

    // Valida todos os itens adicionados
    cy.get('.cart_item').should('have.length', 6)

    // Remove TODOS os itens do carrinho
    cy.get('[data-test^="remove"]').each(($button) => {
      cy.wrap($button).click()
    })

    // Verifica carrinho vazio
    cy.get('.shopping_cart_badge').should('not.exist')
    cy.get('.cart_item').should('not.exist')
  })
})