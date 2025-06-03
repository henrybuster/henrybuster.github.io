require 'sinatra'
require 'stripe'

# This is your test secret API key.
Stripe.api_key = 'sk_test_51RVgPTQWkT8TMd2N6AqsPKJ3R7q0UL0E5pkOeCgmBRyq3GTrupSUFp3v1gXuA1MMlUfyGtUf3mq7gSOVLHHmZtBD00q0j6YMnr'

Stripe.api_version = '2023-10-16'

set :static, true
set :port, 4242
set :public_folder, 'dist'

post '/account_session' do
  content_type 'application/json'

  body = JSON.parse(request.body.read)
  connected_account_id = body["account"]

  begin
    account_session = Stripe::AccountSession.create({
      account: connected_account_id,
      components: {
        account_onboarding: {enabled: true},
      }
    })

    {
      client_secret: account_session[:client_secret]
    }.to_json
  rescue => error
    puts "An error occurred when calling the Stripe API to create an account session: #{error.message}";
    return [500, { error: error.message }.to_json]
  end
end

post '/account' do
  content_type 'application/json'

  begin
    account = Stripe::Account.create({
      controller: {
        stripe_dashboard: {
          type: "none",
        },
        fees: {
          payer: "application"
        },
        losses: {
          payments: "application"
        },
        requirement_collection: "application",
      },
      capabilities: {
        transfers: {requested: true}
      },
      country: "US",
    })

    {
      account: account[:id]
    }.to_json
  rescue => error
    puts "An error occurred when calling the Stripe API to create an account: #{error.message}";
    return [500, { error: error.message }.to_json]
  end
end

get '/*path' do
  send_file File.join(settings.public_folder, 'index.html')
end