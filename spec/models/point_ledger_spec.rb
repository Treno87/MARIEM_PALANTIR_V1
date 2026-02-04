# frozen_string_literal: true

require "rails_helper"

RSpec.describe PointLedger, type: :model do
  let(:store) { create(:store) }
  let(:customer) { create(:customer, store: store) }
  let(:visit) { create(:visit, store: store, customer: customer) }
  let(:ledger) { described_class.new(store) }

  describe "#redeem" do
    context "포인트 잔액 충분" do
      before do
        # 포인트 적립
        PointTransaction.create!(
          store: store,
          customer: customer,
          txn_type: "earn",
          points_delta: 1000
        )
      end

      it "포인트를 차감한다" do
        payment = create(:payment, visit: visit, store: store, method: "points", amount: 500)

        txn = ledger.redeem(customer: customer, points: 500, visit: visit, payment: payment)

        expect(txn).to be_persisted
        expect(txn.points_delta).to eq(-500)
        expect(customer.point_balance).to eq(500)
      end
    end

    context "포인트 잔액 부족" do
      it "InsufficientPointsError를 발생시킨다" do
        payment = create(:payment, visit: visit, store: store, method: "points", amount: 500)

        expect {
          ledger.redeem(customer: customer, points: 500, visit: visit, payment: payment)
        }.to raise_error(PointLedger::InsufficientPointsError)
      end
    end

    context "트랜잭션 내에서 실행" do
      before do
        PointTransaction.create!(
          store: store,
          customer: customer,
          txn_type: "earn",
          points_delta: 1000
        )
      end

      it "트랜잭션으로 감싸져 있다" do
        payment = create(:payment, visit: visit, store: store, method: "points", amount: 100)

        expect(ActiveRecord::Base).to receive(:transaction).and_call_original

        ledger.redeem(customer: customer, points: 100, visit: visit, payment: payment)
      end
    end
  end
end
