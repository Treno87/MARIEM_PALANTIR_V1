# frozen_string_literal: true

require "rails_helper"

RSpec.describe PrepaidLedger, type: :model do
  let(:store) { create(:store) }
  let(:customer) { create(:customer, store: store) }
  let(:prepaid_plan) { create(:prepaid_plan, store: store, price_paid: 100_000, value_amount: 120_000) }
  let(:prepaid_sale) { create(:prepaid_sale, store: store, customer: customer, prepaid_plan: prepaid_plan, value_amount: 120_000) }
  let(:visit) { create(:visit, store: store, customer: customer) }
  let(:ledger) { described_class.new(store) }

  describe "#use" do
    context "정상 사용" do
      it "정액권 잔액을 차감한다" do
        prepaid_sale # ensure created

        usage = ledger.use(customer: customer, amount: 50_000, visit: visit, prepaid_sale_id: prepaid_sale.id)

        expect(usage).to be_persisted
        expect(prepaid_sale.reload.remaining_balance).to eq(70_000)
      end
    end

    context "잔액 부족" do
      it "InsufficientBalanceError를 발생시킨다" do
        prepaid_sale # ensure created

        expect {
          ledger.use(customer: customer, amount: 200_000, visit: visit, prepaid_sale_id: prepaid_sale.id)
        }.to raise_error(PrepaidLedger::InsufficientBalanceError)
      end
    end

    context "정액권 없음" do
      it "NoPrepaidSaleError를 발생시킨다" do
        expect {
          ledger.use(customer: customer, amount: 50_000, visit: visit)
        }.to raise_error(PrepaidLedger::NoPrepaidSaleError)
      end
    end

    context "트랜잭션과 잠금" do
      it "트랜잭션 내에서 실행된다" do
        prepaid_sale # ensure created

        expect(ActiveRecord::Base).to receive(:transaction).and_call_original

        ledger.use(customer: customer, amount: 10_000, visit: visit, prepaid_sale_id: prepaid_sale.id)
      end
    end
  end
end
